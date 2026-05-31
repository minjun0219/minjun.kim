---
title: "AppleGothic과 Apple SD Neo Gothic"
date: "2012-03-28"
author:
  name: logan
  email: "hi@minjun.kim"
---

요즘 맥과 아이폰 관련 커뮤니티에서는 AppleGothic과 Apple SD Neo Gothic이 자주 등장합니다. 애플은 그동안 AppleGothic을 맥과 iOS의 기본서체로 사용하고 있었습니다.

그런데 이 녀석이 인쇄용 서체(주워 들은 바에 의하면)라서 모니터 넘어로 보는 화면은 한글이 자글자글 하고 가독성도 떨어져 특히 Safari와 같은 웹브라우저에서 글을 읽으려면 눈이 아프다고 호소하는 글을 많이 보였습니다.

국내에 아이폰 사용자가 증가하고 애플도 국내 시장에 관심을 보이면서 [한글 글꼴을 바꿔주겠다고 약속](http://www.zdnet.co.kr/news/news_view.asp?artice_id=20110720145007) 했고 iOS 5.0 Beta 3에 "Apple SD Neo Gothic"이라는 서체를 추가하고 기본글꼴 테스트를 하더니 iOS 5.1 정식버전에 채용했고 OS X Mountin Lion Beta에도 기본글꼴화 될 예정이라고 합니다.

이쯤에서 짚고 넘어가야 할 사항이 있습니다. 국내에 iOS가 널리 배포되면서 웹을 제작할때 "AppleGothic"을 CSS상에서 정의한 사례가 종종 있습니다. 왜냐하면 가독성은 안 좋지만 Mac OS에 들어가 있는 유일한 한글 서체가 "AppleGothic"과 "AppleMyeongjo"고 유일한 대안이 AppleGothic이었기 때문입니다.

그렇다고 서체 지정을 안 하자니 Mac에서 MS Office를 설치하면 Windows에서 쓰는 굴림보다 못생긴 맥용 굴림체가 설치되어 AppleGothic보다 안 예쁘게 나옵니다.

그래서 제 경우에는 iOS 5.1 Beta 3가 나온 시점을 기준으로 이후에 제작하는 모바일 사이트와 웹페이지는 "Apple SD Neo Gothic"을 기본 포함하고 "AppleGothic"보다 먼저 선언 해 줍니다. [(관련글)](https://www.facebook.com/groups/webpublisher/281299898580829/)

블로그 글을 보다보니 ["AppleGothic"을 아예 빼자는 의견](http://story.pxd.co.kr/493)도 있는데요. 웹 개발자 입장에서 AppleGothic을 빼는 것이 과연 타당한 일 인지는 좀 의아합니다. 물론, CSS상에서 폰트 지정을 하지 않으면 사용자가 웹브라우저에서 지정한 폰트로 보이지게 됩니다.

어찌보면 폰트지정을 serif와 sans-serif로만 지정하여 사용자에게 선택권을 부여하는 것도 좋은 방법이겠지만 반대로 "Apple SD Neo Gothic"과 "AppleGothic"을 함께 적어주되 "Apple SD Neo Gothic"을 먼저 선언 해 주어 폰트 지정을 해 주는 것이 더 현명한 방법은 아닐까 싶은 생각도 있습니다.
