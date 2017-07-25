package main

import (
	"bytes"
	"errors"
	"fmt"
	"github.com/fatih/color"
	"github.com/google/uuid"
	"github.com/levigross/grequests"
	"gopkg.in/cheggaaa/pb.v1"
	"gopkg.in/src-d/go-billy.v3"
	"gopkg.in/src-d/go-billy.v3/osfs"
	"gopkg.in/src-d/go-git.v4"
	"gopkg.in/src-d/go-git.v4/config"
	"gopkg.in/src-d/go-git.v4/plumbing"
	"gopkg.in/src-d/go-git.v4/plumbing/filemode"
	"gopkg.in/src-d/go-git.v4/plumbing/format/index"
	"gopkg.in/src-d/go-git.v4/plumbing/object"
	gitHTTP "gopkg.in/src-d/go-git.v4/plumbing/transport/http"
	"gopkg.in/src-d/go-git.v4/storage"
	"gopkg.in/src-d/go-git.v4/storage/filesystem"
	gitioutil "gopkg.in/src-d/go-git.v4/utils/ioutil"
	"io"
	"io/ioutil"
	"os/signal"
	"strings"
	"time"

	//"net/http"
	"os"
	"path"
	"path/filepath"
)

type Repo struct {
	Path    string
	GitRepo *git.Repository
}

var _ = fmt.Println

// Start from the given path, recursively go up
// until a git repository is found.
func GetRepo(repoPath string) (*Repo, error) {
	repoPath = path.Clean(repoPath)
	for {
		_, err := git.PlainOpen(repoPath)
		if err == nil {
			break
		}
		if repoPath == "/" || repoPath == "." {
			return nil, errors.New("No repo found from " + repoPath)
		}
		repoPath = path.Dir(repoPath)
	}
	gitRepo, err := git.PlainOpen(repoPath)
	if err != nil {
		return nil, err
	}

	repoPath, _ = filepath.Abs(repoPath)

	repo := Repo{
		Path:    repoPath,
		GitRepo: gitRepo,
	}
	return &repo, nil
}

// Implement custom functions of worktree.
// https://github.com/src-d/go-git/blob/master/worktree_commit.go
type Worktree struct {
	git.Worktree

	r  *git.Repository
	fs billy.Filesystem
	s  storage.Storer

	trees   map[string]*object.Tree
	entries map[string]*object.TreeEntry
}

func (w *Worktree) commitIndexEntry(e *index.Entry) error {
	parts := strings.Split(e.Name, "/")

	var fullpath string
	for _, part := range parts {
		parent := fullpath
		fullpath = path.Join(fullpath, part)

		w.doBuildTree(e, parent, fullpath)
	}

	return nil
}

func (w *Worktree) doBuildTree(e *index.Entry, parent, fullpath string) {
	if _, ok := w.trees[fullpath]; ok {
		return
	}

	if _, ok := w.entries[fullpath]; ok {
		return
	}

	te := object.TreeEntry{Name: path.Base(fullpath)}

	if fullpath == e.Name {
		te.Mode = e.Mode
		te.Hash = e.Hash
	} else {
		te.Mode = filemode.Dir
		w.trees[fullpath] = &object.Tree{}
	}

	w.trees[parent].Entries = append(w.trees[parent].Entries, te)
}

func (w *Worktree) copyFileToStorage(path string) (hash plumbing.Hash, err error) {
	fi, err := w.fs.Lstat(path)
	if err != nil {
		fmt.Println("err", err)
		return plumbing.ZeroHash, err
	}

	obj := w.r.Storer.NewEncodedObject()
	obj.SetType(plumbing.BlobObject)
	obj.SetSize(fi.Size())

	writer, err := obj.Writer()
	if err != nil {
		return plumbing.ZeroHash, err
	}

	defer gitioutil.CheckClose(writer, &err)

	if fi.Mode()&os.ModeSymlink != 0 {
		err = w.fillEncodedObjectFromSymlink(writer, path, fi)
	} else {
		err = w.fillEncodedObjectFromFile(writer, path, fi)
	}

	if err != nil {
		return plumbing.ZeroHash, err
	}

	return w.r.Storer.SetEncodedObject(obj)
}

func (w *Worktree) fillEncodedObjectFromFile(dst io.Writer, path string, fi os.FileInfo) (err error) {
	src, err := w.fs.Open(path)
	if err != nil {
		return err
	}

	defer gitioutil.CheckClose(src, &err)

	if _, err := io.Copy(dst, src); err != nil {
		return err
	}

	return err
}

func (w *Worktree) fillEncodedObjectFromSymlink(dst io.Writer, path string, fi os.FileInfo) error {
	target, err := w.fs.Readlink(path)
	if err != nil {
		return err
	}

	_, err = dst.Write([]byte(target))
	return err
}

// Add adds the file contents of a file in the worktree to the index. if the
// file is already stagged in the index no error is returned.
func (w *Worktree) Add(path string, idx *index.Index) (plumbing.Hash, error) {
	s, err := w.Status()
	if err != nil {
		return plumbing.ZeroHash, err
	}

	h, err := w.copyFileToStorage(path)
	if err != nil {
		return h, err
	}

	if s.File(path).Worktree == git.Unmodified {
		return h, nil
	}

	if err := w.addOrUpdateFileToIndex(path, h, idx); err != nil {
		return h, err
	}

	return h, err
}

func (w *Worktree) doAddFileToIndex(idx *index.Index, filename string, h plumbing.Hash) error {
	e := &index.Entry{Name: filename}
	idx.Entries = append(idx.Entries, e)

	return w.doUpdateFileToIndex(e, filename, h)
}

func (w *Worktree) doUpdateFileToIndex(e *index.Entry, filename string, h plumbing.Hash) error {
	info, err := w.fs.Lstat(filename)
	if err != nil {
		return err
	}

	e.Hash = h
	e.ModifiedAt = info.ModTime()
	e.Mode, err = filemode.NewFromOSFileMode(info.Mode())
	if err != nil {
		return err
	}

	if e.Mode.IsRegular() {
		e.Size = uint32(info.Size())
	}

	if fillSystemInfo != nil {
		fillSystemInfo(e, info.Sys())
	}

	return nil
}

func (w *Worktree) addOrUpdateFileToIndex(filename string, h plumbing.Hash, idx *index.Index) error {
	e, err := idx.Entry(filename)
	if err != nil && err != index.ErrEntryNotFound {
		return err
	}
	if err == index.ErrEntryNotFound {
		fmt.Println("Add")
		if err := w.doAddFileToIndex(idx, filename, h); err != nil {
			return err
		}
	} else {
		if err := w.doUpdateFileToIndex(e, filename, h); err != nil {
			return err
		}
	}

	return nil
}

func (w *Worktree) BuildTree(idx *index.Index) (plumbing.Hash, error) {
	const rootNode = ""
	w.trees = map[string]*object.Tree{rootNode: {}}
	w.entries = map[string]*object.TreeEntry{}

	for _, e := range idx.Entries {

		if err := w.commitIndexEntry(e); err != nil {
			return plumbing.ZeroHash, err
		}
	}

	return w.copyTreeToStorageRecursive(rootNode, w.trees[rootNode])
}

func (w *Worktree) addIndexFromFile(name string, h plumbing.Hash, idx *index.Index) error {
	fs := w.r.Storer.(*filesystem.Storage).Filesystem()
	fi, err := fs.Lstat(name)
	if err != nil {
		return err
	}

	mode, err := filemode.NewFromOSFileMode(fi.Mode())
	if err != nil {
		return err
	}

	e := &index.Entry{
		Hash:       h,
		Name:       name,
		Mode:       mode,
		ModifiedAt: fi.ModTime(),
		Size:       uint32(fi.Size()),
	}

	// if the FileInfo.Sys() comes from os the ctime, dev, inode, uid and gid
	// can be retrieved, otherwise this doesn't apply
	if fillSystemInfo != nil {
		fillSystemInfo(e, fi.Sys())
	}

	idx.Entries = append(idx.Entries, e)
	return nil
}

var fillSystemInfo func(e *index.Entry, sys interface{})

func (w *Worktree) copyTreeToStorageRecursive(parent string, t *object.Tree) (plumbing.Hash, error) {
	for i, e := range t.Entries {
		if e.Mode != filemode.Dir && !e.Hash.IsZero() {
			continue
		}

		path := path.Join(parent, e.Name)

		var err error
		e.Hash, err = w.copyTreeToStorageRecursive(path, w.trees[path])
		if err != nil {
			return plumbing.ZeroHash, err
		}

		t.Entries[i] = e
	}

	o := w.s.NewEncodedObject()
	if err := t.Encode(o); err != nil {
		return plumbing.ZeroHash, err
	}

	return w.s.SetEncodedObject(o)
}

func (w *Worktree) autoAddModifiedAndDeleted(idx *index.Index) error {
	s, err := w.Status()
	if err != nil {
		return err
	}

	for path, fs := range s {
		if fs.Worktree != git.Modified && fs.Worktree != git.Deleted {
			continue
		}

		if _, err := w.Add(path, idx); err != nil {
			return err
		}

	}

	return nil
}

func (w *Worktree) buildCommitObject(msg string, opts *git.CommitOptions, tree plumbing.Hash) (plumbing.Hash, error) {
	commit := &object.Commit{
		Author:       *opts.Author,
		Committer:    *opts.Committer,
		Message:      msg,
		TreeHash:     tree,
		ParentHashes: opts.Parents,
	}

	obj := w.r.Storer.NewEncodedObject()
	if err := commit.Encode(obj); err != nil {
		return plumbing.ZeroHash, err
	}
	return w.r.Storer.SetEncodedObject(obj)
}

// Silent commit creates a commit in the index, but does not update the HEAD.
func (repo *Repo) SilentCommit(opts *git.CommitOptions) (plumbing.Hash, error) {
	r := repo.GitRepo
	if err := opts.Validate(r); err != nil {
		return plumbing.ZeroHash, err
	}

	oldW, err := r.Worktree()
	if err != nil {
		return plumbing.ZeroHash, err
	}
	w := &Worktree{
		Worktree: *oldW,
		fs:       osfs.New(repo.Path),
		s:        r.Storer,
		r:        r,
	}

	idx, err := r.Storer.Index()
	if err != nil {
		return plumbing.ZeroHash, err
	}

	if err := w.autoAddModifiedAndDeleted(idx); err != nil {
		return plumbing.ZeroHash, err
	}

	tree, err := w.BuildTree(idx)
	if err != nil {
		return plumbing.ZeroHash, err
	}

	commit, err := w.buildCommitObject("Warpdrive commit", opts, tree)
	if err != nil {
		return plumbing.ZeroHash, err
	}

	return commit, nil
}

// Push code to remote registry.
func (repo *Repo) PushCode(token string, url string) (string, error) {
	//// Implementation based on Proxy Server
	//// Deprecated because go-git does not support proxy easily.
	//Port := 15900
	//// Create a proxy so we can add authentication HTTP headers.
	//fmt.Println("Starting proxy")
	//proxy := goproxy.NewProxyHttpServer()
	//proxy.Verbose = true
	//proxy.OnRequest().DoFunc(
	//	func(r *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
	//		if token != "" {
	//			r.Header.Set("Authorization", token)
	//		}
	//		return r, nil
	//	})

	//go func() {
	//	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", Port), proxy))
	//}()

	//for {
	//	time.Sleep(10 * time.Millisecond)
	//	resp, err := http.Get(fmt.Sprintf("http://localhost:%d", Port))
	//	if err != nil {
	//		continue
	//	}

	//	resp.Body.Close()
	//	break
	//}

	// Push code through Git.

	// Analyze Git Worktree.
	commit, err := repo.SilentCommit(&git.CommitOptions{
		Author: &object.Signature{
			// Adding a UUID makes sure commit hash is different even within the same second.
			Name:  "warpdrive-" + uuid.New().String(),
			Email: "warp@dummy.ai",
			When:  time.Now(),
		},
	})
	if err != nil {
		return "", err
	}

	// Create branch.
	branchRef := "refs/heads/" + commit.String()
	branch := plumbing.NewHashReference(plumbing.ReferenceName(branchRef), commit)
	err = repo.GitRepo.Storer.SetReference(branch)
	if err != nil {
		panic(err)
	}
	removeBranch := func() { // Remove branch after done.
		repo.GitRepo.Storer.RemoveReference(plumbing.ReferenceName(branchRef))
	}
	defer removeBranch()

	// Create remote.
	remoteName := "warpdrive-f683ed0a23" // any name.
	_, err = repo.GitRepo.CreateRemote(&config.RemoteConfig{
		Name: remoteName,
		URL:  url,
	})
	removeRemote := func() { // Remove remote after done.
		repo.GitRepo.DeleteRemote(remoteName)
	}
	defer removeRemote()

	// Allow clean up after Ctrl-C.
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		for sig := range c {
			fmt.Println("sig INT", sig)
			removeBranch()
			removeRemote()
			os.Exit(1)
		}
	}()

	if err != nil {
		return "", err
	}

	auth := gitHTTP.NewTokenAuth(token)
	options := git.PushOptions{
		RemoteName: remoteName,
		Auth:       auth,
		RefSpecs: []config.RefSpec{
			config.RefSpec(fmt.Sprintf("+refs/heads/%s:refs/heads/%s",
				commit.String(), commit.String())),
		},
	}

	err = repo.GitRepo.Push(&options)
	if err != nil {
		return "", err
	}

	return commit.String(), nil
}

// ChunckedReader for showing smoother progressbar.
const ReaderChunckSize = 1024

type ChunckedReaderCallback func(bytesRead int)

type ChunckedReader struct {
	b        *bytes.Buffer
	callback ChunckedReaderCallback
}

func NewChunckedReader(buf []byte, callback ChunckedReaderCallback) *ChunckedReader {
	reader := ChunckedReader{
		b:        bytes.NewBuffer(buf),
		callback: callback,
	}
	return &reader
}

func (reader *ChunckedReader) Read(p []byte) (n int, err error) {
	totalRead := 0
	for i := 0; i < len(p); {
		chunckSize := ReaderChunckSize
		if len(p)-i < ReaderChunckSize {
			chunckSize = len(p) - i
		}
		newBytes := reader.b.Next(chunckSize)
		if len(newBytes) == 0 {
			return totalRead, io.EOF
		}
		chunckSize = len(newBytes)

		for j := i; j < i+chunckSize; j++ {
			p[j] = newBytes[j-i]
		}
		if reader.callback != nil {
			reader.callback(chunckSize)
		}
		i += chunckSize
		totalRead += chunckSize
	}
	return totalRead, nil
}

// Push data to cloud storage given paths to assets in the repo.
func (repo *Repo) PushData(assets []string, user string, name string, commit string) error {
	if len(assets) == 0 {
		return nil
	}

	// Calculate total size of the assets in Bytes.
	var totalSize int64 = 0

	for _, asset := range assets {
		filePath := filepath.Join(repo.Path, asset)

		fi, err := os.Stat(filePath)
		if err != nil {
			return err
		}

		totalSize += fi.Size()
	}

	bar := pb.New64(totalSize).Format(strings.Join([]string{
		color.GreenString("["),
		color.New(color.BgGreen).SprintFunc()(" "),
		color.New(color.BgHiGreen).SprintFunc()(" "),
		color.New(color.BgBlack).SprintFunc()(" "),
		color.GreenString("]"),
	}, "\x00"))
	bar.SetRefreshRate(1 * time.Millisecond)
	bar.ShowPercent = true
	bar.ShowBar = true
	bar.SetWidth(80)
	bar.SetUnits(pb.U_BYTES)
	bar.Start()

	api := MasterAPI{}

	var totalRead int64 = 0
	cwd, _ := os.Getwd()

	for _, asset := range assets {
		url, err := api.GetAssetURL(user, name, commit, asset, "PUT")
		if err != nil {
			return err
		}

		assetRel, _ := filepath.Rel(cwd, filepath.Join(repo.Path, asset))

		data, err := ioutil.ReadFile(assetRel)
		if err != nil {
			return err
		}

		callback := func(bytesRead int) {
			totalRead += int64(bytesRead)
			bar.Set64(totalRead)
		}

		_, err = grequests.Put(url,
			&grequests.RequestOptions{
				RequestBody: NewChunckedReader(data, callback),
				Headers: map[string]string{
					"Content-Type": "application/octet-stream",
				},
			})

	}

	bar.Finish()
	fmt.Println("Done!")

	return nil
}

// Get current working repo.
func GetWorkingRepo() (*Repo, error) {
	dir, err := os.Getwd()
	if err != nil {
		return nil, err
	}

	repo, err := GetRepo(dir)
	if err != nil {
		return nil, err
	}

	return repo, nil
}
