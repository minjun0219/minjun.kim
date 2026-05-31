---
title: "Retina Display에서 1px을 1px로 보이게 하는 법"
date: "2013-04-16"
author:
  name: logan
  email: "hi@minjun.kim"
---

최근 웹 작업을 하면서 Retina Display를 대응할 수 밖에 없는데요. 아이폰은 해상도가 960x640입니다. 때문에 디자인도 해당 해상도를 기준으로 작업이 되는데요. 웹 작업 하시는 분들은 이미 알고 계시겠지만 아이폰에 들어가는 모바일 사파리를 포함해 모바일 웹브라우저는 Retina Display와를 별개로 480x320으로 인식합니다.

이 부분 때문에 기존의 Retina Display가 아닌 모바일 웹페이지를 볼때에는 문제가 없지만 1px를 표현할때에는 조금 애매한 문제가 생기게 됩니다. border라던가 특정 라인을 표시할때 1px를 자주 사용하게 되는데 Retina Display에서는 1px을 실제로는 2px로 표현하고 있다는 점 입니다. 어쩌면 이 부분이 별것 아닌 것 처럼 보이지만 디자이너 입장에서는 1px도 매우 소중합니다(...?!)

때문에 이 같은 이유로 열심히 구글링을 해 보았지만 별 소득은 없었습니다. 그 중에서도 [Swipe.js](http://swipejs.com)를 만든 [Brad Birdsall](http://bradbirdsall.com/) 아저씨가 만든 ["Modile Web in High Resolution"이란 문서](http://bradbirdsall.com/mobile-web-in-high-resolution)가 구글 최 상단에 뜨기는 하는데요. 이 문서가 안내하는 방법은 Retina Display일 경우, 즉 기기의 화면 비율(Device Pixel Ratio)이 1.5배 이상일 경우 [box-shadow](https://developer.mozilla.org/en-US/docs/CSS/box-shadow)를 살짝 주어서 1 pixel 처럼 보이도록 하는 일종의 눈 속임 입니다.

하지만, 이 방법을 쓰면 버튼 주변이 지저분 해 지는 단점이 생겨나게 됩니다. 또한, 버튼이 아니라 텍스트 입력 박스의 경우 background-color를 하얀색(#fff)이고 border만 색상을 주게 되는데 굉장히 지저분해 지는 문제가 생기더라구요. 그래서 오랜 고심끝에 정말 무식한 방법을 사용했습니다.

일단, 먼저 1 pixel을 border를 가지고 있는 박스를 하나 만들어 주고요. 스타일을 입혀줍니다.

```css
input[type="text"]{
    border: 1px solid #dadada;
    width: 256px;
    height: 30px;
    padding: 0 12px;
    font-size: 13px;
    font-weight: bold;
    color: #323232;
}
```

이렇게 마크업을 하면 평범한 텍스트 입력 박스가 만들어 지게 됩니다. 물론, Retina Display에서도 2 pixel로 표현이 될 겁니다.

![](/images/posts/input_text_1px.png)

이제, border를 1 pixel로 만들 차례 인데요. 사용자의 Mobile Web browser가 [CSS3 Transform](https://developer.mozilla.org/en-US/docs/CSS/transform)을 지원한다는 가정하에 Transform를 이용해 2배 뻥튀기 시켜 줍니다..-_-;

```css
@media only (-webkit-min-device-pixel-ratio: 1.5){
    input[type="text"]{
        width: 512px; /* 256*2 */
        height: 60px; /* 30*2 */
        padding: 0 24px; /* 12*2 */
        font-size: 26px; /* 13*2 */

        -webkit-transform: scale(0.5); /* 모든 사이즈를 2배씩 늘렸기 때문에 transform은 0.5배로 조절합니다. */
        -webkit-transform-origin: 0 0;
        -webkit-transform-style: flat;
    }
}
```

코드를 보시면 느끼시겠지만 정말 무식한 방법입니다. Retina Display에서 border만 50% 줄이기 위해 border-width를 제외한 모든 사이즈를 2배씩 늘이고 Transform을 이용해 50% 줄이면 보시는 대로 border-width가 전보다 더 가늘어 진 것을 느끼실 수 있습니다. 보기에도 훨씬 깔끔 해 보이구요.

![](/images/posts/input_text_real_1px.png)

하지만, 여기에도 문제점은 있습니다. 모든 사이즈를 2배 늘이고 Scale만 50% 줄인 것이기 때문에 웹브라우저에서는 여전히 50% 줄이기 이전의 사이즈로 인지하기 때문에 줄어든 나머지 공간에는 여백이 생겨나게 됩니다. 이 여백은 상위 DOM에서 강제로 사이즈를 지정해 주는 방법 밖에는 없습니다.

```css
.input-text{
    height: 32px;
}
```

이렇게 작성 하셔야 빈 여백이 생겨나는 것을 방지하실 수 있습니다. 폼을 dl,dt,dd로 작성 하실 경우에는 dd에 강제 사이즈를 지정하시는 것도 좋은 방법입니다. 물론, 이 방법 때문에 불 필요한 태그 요소가 발생하는 것은 사실입니다. 때문에 이 방법을 추천드리고 싶지는 않습니다.

하지만, 필요하다면 box-shadow를 사용하시는 것 보다는 transform을 적절히 이용하는 것도 한 방법일 수 있을 것 같습니다.

현재, Flava Web의 [아이디,비밀번호 찾기 페이지](https://www.takeflava.com/account/forgot.php)와 Flava 앱 내에 암호 변경 페이지에 실제 적용되어져 있습니다.
