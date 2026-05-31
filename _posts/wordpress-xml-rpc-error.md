---
title: "WordPress XML-RPC 오류 관련"
date: "2015-11-17"
author:
  name: logan
  email: "hi@minjun.kim"
---

서버에 PHP 5.5.x 버전을 설치한 후 WordPress의 일부 기능이 작동되지 않아 오류 로그를 살펴 보니 아래와 같은 오류가 있었습니다.

**PHP Fatal error:  Call to undefined function xml_parser_create() in /........./www/wp-includes/class-IXR.php on line 264**

PHP를 재 설치할 때 제가 php-xml을 설치하지 않은 게 화근이었던 것 같습니다. 그래서, 서버에 yum으로 php-xml을 설치해 주었습니다.

```bash
$ yum --enablerepo=remi-php55 install php-xml
```

설치가 끝나면 서버를 재 시작 합니다.

```bash
$ service httpd restart
```

이제, 정상적으로 동작 합니다. WordPress에 Jetpack이 연결되지 않아 한참 고생했네요.

**관련글**

- [Call to undefined function xml_parser_create() .... - TrippyBoyの愉快な日々](http://blog.trippyboy.com/2014/wordpress/call-undefined-function-xml_parser_create-varwwwblogwp-includesclass-ixr-php-line-237/)
