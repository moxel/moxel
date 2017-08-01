package main

import (
	"fmt"
	"os"
)

var KubeConfig = "secrets-prod/admin.conf"
var gcsBucket string = "dummy-dev"
var gcsCredentials string = "secrets-prod/dummy-87bbacfcb748.json"

const MasterPort = 8080

const JWT_PUBLIC_KEY_CLI = `
-----BEGIN CERTIFICATE-----
MIIC/TCCAeWgAwIBAgIJWbfto6l1EqOqMA0GCSqGSIb3DQEBCwUAMBwxGjAYBgNV
BAMTEWR1bW15YWkuYXV0aDAuY29tMB4XDTE3MDcyMzA1MDcyNloXDTMxMDQwMTA1
MDcyNlowHDEaMBgGA1UEAxMRZHVtbXlhaS5hdXRoMC5jb20wggEiMA0GCSqGSIb3
DQEBAQUAA4IBDwAwggEKAoIBAQDHSVXSfsyLjwQroJRxFsn8WuR/tsT4VhAtENwv
kLNpqUtpuuBCK1p9M1y82rBgRCErnAS3M2EMxK6dzs6vYKtbeqENzEQTan+hBRBB
ZujtD26+TNNLxSDDSbrzR86aeKoX92sEpiXHx0HGFA4qoyH2talaNpnh+hiG0FaD
9MrGRrctcPNKBkDVBovmOeAA2yAl2QCsQ17N28CCfHMlzrBvz2TDg6GMY86z672w
Ryo06xy3ooPNE9+vNiUoMChReyU6a9yOdZtg6aEGjOAuDvkTXCTy38a7DOAT7ltI
4QWxqjfldpvUQ75uJlZ9if0vgZevHbuUlQv9JK70/xpRQWVxAgMBAAGjQjBAMA8G
A1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFNJbPC0XLccatPdCDzoDDk+DTkrjMA4G
A1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEArMeXY2Yu9zUwfL6vzlB2
ZSwjAPgTTe8cbeDH6PDZpClKIvAyE/sCfdkFwTG7yPq6mnhg4yaSu9f+vShwTcIs
eSUlYdrR+B68wpXqvpyramu47Ap4O07askLbKVS4Dzzz3qqHfaXSfNT4VUBPLXCm
QAIjLrTebuhT2lqHizoWVflNQf8lk+b2TcPI+kdEhzq4gdNehgltDWETC5d5MzID
a95Gjd+Ifgcs5Um89SvdMKNTXXTVFz2+g1l3FMqV9ydneLlahGBFB820BqakauuJ
Nb01fCtaX0uzLOfGzZ2ZZX0V63C/OR6nSLkJKnItxAJEFJogNr6Fi3dxLNYWbeaM
3g==
-----END CERTIFICATE-----
`

var GitRegistry string = "http://beta.dummy.ai/git"
var GitRoot string = "/mnt/nfs/code"
var GitBin = "/usr/bin/git"

func InitGlobal() {
	env := os.Getenv("ENV")
	fmt.Println("ENV", env)
	if env == "local" {
		// Run in dev mode.
		GitRegistry = fmt.Sprintf("http://localhost:%d/git", MasterPort)
		GitRoot = "/tmp/code"
		KubeConfig = "secrets-dev/admin.conf"
		gcsCredentials = "secrets-dev/dummy-87bbacfcb748.json"
	} else if env == "dev" {
		// Run in dev mode.
		GitRegistry = fmt.Sprintf("http://master-dev.dummy.ai:%d/git", MasterPort)
		GitRoot = "/mnt/nfs/code"
		KubeConfig = "secrets-dev/admin.conf"
		gcsCredentials = "secrets-dev/dummy-87bbacfcb748.json"
	} else {
		// default: Production.
	}
}
