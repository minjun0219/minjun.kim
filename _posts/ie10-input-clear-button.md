---
title: "IE10에서 Input Box, Clear 버튼 삭제하기"
date: "2012-12-17"
author:
  name: logan
  email: "hi@minjun.kim"
---

[Flava](http://www.takeflava.com/) 웹앱을 만들던 도중 Input 박스의 Clear 버튼을 Custom으로 구현해야 하는 일이 생겨 만들었는데, Internet Explorer 10에서는 Touch 환경을 고려한다며 input[type=text]에도 Clear 버튼을 달아놨습니다. (아래와 같이 말이죠.)

![](/images/posts/ie10_input_clear.png)

나름 사용자 편의를 위한 장치인데 이게 어쩌다 보니 위와 같은 모양이 되어 버렸죠. 게다가 제가 구현하고자 하는 기능과는 달라 삭제하고 싶어 찾아보니 다행이도 아래와 같은 방법이 있더군요.

```css
input[type=text]::-ms-clear{
    display: none;
}
```

비슷한 고민을 하고 계신 분들께 도움이 되길 바랍니다. 

**참고자료**

- [Disabling auto clear button in IE10](http://answers.microsoft.com/en-us/ie/forum/ie10_cp-windows_cp/disabling-auto-clear-button-in-ie10/791c1e52-27d6-428e-80cb-206b165910d8?msgId=e771457a-43fd-43b1-89e9-839c7a392246)
- [::-ms-clear pseudo-element (Windows)](http://msdn.microsoft.com/en-us/library/windows/apps/hh465740.aspx)
