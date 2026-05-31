---
title: "PHP에서 Session 오류 시 해결 방법"
date: "2012-11-06"
author:
  name: logan
  email: "hi@minjun.kim"
---

PHP와 Javascript로 웹 애플리케이션을 만들고 있는데 PHP쪽에서 [Session](http://kr1.php.net/manual/en/book.session.php)오류와 함께 [HEADER](http://php.net/manual/en/function.header.php)를 제대로 전달하지 못하는 오류를 발견 하였습니다. 특히 HEADER 함수를 이용해 로그인 처리 후 Redirection을 해야 하는데 HEADER위에 무언가가 있다고 자꾸 에러를 내뿜더군요.

![](/images/posts/php_error.png)

근데, 문제는 Textmate나 Subline text 2등의 Editor로는 "<?php" 앞에 어떠한 문자도 없다는게 문제였습니다.

![](/images/posts/code.png)

왜 그럴까 하고 고민하던 중에.. 예전에 "[UTF-8 + BOM](http://blog.wystan.net/2007/08/18/bom-byte-order-mark-problem)"타입의 인코딩 설정 때문에 고생했던 기억이 나서 인코딩 설정을 찾아봤지만 해당 타입의 문서는 아닌것 같았습니다. 그래도 혹시나 해서 Hex Editor로 해당 문서를 열어보니.. 이상한 문자가 섞여 있더군요..;;;

![](/images/posts/hex_editor.png)

아니나 다를까.. Hex Editor상에서 "..."부분을 삭제해 주니 오류가 말끔히 사라졌습니다. 역시.. 아는게 힘! -_-

**참고 URL**

- [UTF-8 인코딩에서의 BOM(Byte Order Mark) 문제](http://blog.wystan.net/2007/08/18/bom-byte-order-mark-problem)
