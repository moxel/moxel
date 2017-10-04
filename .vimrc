" options for custom project vim config
let g:ctrlp_custom_ignore = 'examples\|\v[\/]\.(git|build)$'

function! UpdateTags()
  let cmd = 'gotags -R -f tags -L master-server/*.go'
  let resp = system(cmd)
  let cmd = 'gotags -R -f tags -L cli/*.go'
  let resp = system(cmd)
endfunction
autocmd BufWritePost *.go call UpdateTags()

