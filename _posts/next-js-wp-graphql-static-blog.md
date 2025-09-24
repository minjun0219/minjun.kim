---
title: "Next.js와 WordPress로 블로그 만들기"
date: "2020-05-24"
author:
  name: logan
  email: "hi@minjun.kim"
---

> 현재 기준으로는 Wordpress를 사용하지 않고 있습니다. (2024/09/24)

블로그를 꽤 오랜기간 운영하다가 묵은 글을 정리하고 블로그를 그만 둔 지 꽤 흘렀습니다. 그러나 개발을 하면서 겪었던 일이나 경험 등을 기록으로 남겨 두어야 한다는 생각에 블로그를 다시 시작하고자 여러가지 대안을 두고 고민 하였고 그 중에 3가지 정도로 줄어들었습니다.

- Medium
- WordPress
- Markdown으로 작성하고 Static 생성

Medium은 특별한 관리가 필요하지 않아 사용하려고 했었고 WordPress는 이미 오래 사용해 왔으나 직접 설치하여 사용하고자 하면 서버를 관리하거나 비용을 지불해야 했습니다. Markdown으로 작성하고 Next.js, Gatsby등을 이용해 블로그를 만들고 gh-pages나 Netlify에 호스팅 하는 방법도 있고 이 방법이 개발자들이 가장 많이 사용하는 방법입니다.

Markdown이 익숙하고 글을 쓰기에도 가장 좋은 방법이긴 하지만 Markdown 파일을 잘 관리할 자신이 없었고 블로그란 생각났을 때 글쓰기를 시작해야 하는데 Markdown은 왠지 그러지 못할 것 같았습니다.

물론 WordPress만 사용하여 블로그를 운영 하는 것도 훌륭한 대안 입니다. 다만 WordPress는 PHP로 만들어져 테마도 PHP로 개발되어야 하고 PHP는 다룬지 오래되어 현 시점에서는 익숙하지 않은 것이 가장 큰 걸림돌 이었습니다.

여러가지 대안을 두고 고민하던 중에 Next.js 9.3에서 Static Site Generation(SSG) 관련 업데이트가 있었고 Next.js 9.4 버전이 업데이트 되면서 CMS 서비스를 활용한 예제가 추가되어 Next.js의 SSG를 활용하면 재미있을 것 같다는 생각에 소개된 예제를 바탕으로 5종의 CMS 서비스를 검토했습니다.

> [CMS Examples](https://nextjs.org/blog/next-9-4#cms-examples)

소개된 CMS 서비스를 활용해 보고자 비교해 보았지만 우선 CMS 서비스가 클라우드 방식이라 익숙하지 않았고 트래픽이나 데이터 양에 따라 과금되는 방식이라 개인 블로그로 활용하기에는 적합하지 않다고 생각하여 혹시나 하는 마음에 WordPress를 CMS 도구로서 활용하고 Next.js에서 SSG로 생성하는 방안을 고민하기 시작했습니다.

역시 사람들이 하는 생각은 다들 비슷한지 WordPress를 GraphQL로 활용할 수 있는 [wp-graphql](https://github.com/wp-graphql/wp-graphql)라는 WordPress Plugin을 발견하였습니다. 아직 정식 버전도 나오지 않은 Plugin 이지만 활용하고자 하는 기능은 WordPress에서 작성된 글을 Next.js의 [getStaticProps](https://nextjs.org/docs/basic-features/data-fetching)에서 호출해 블로그 화면을 구성하기만 하면 되서 충분해 보였습니다.

## wp-graphql 설치

WordPress는 서버에 FTP가 사용할 수 있는 환경이라면 대시보드를 통해 Plugin을 손 쉽게 설치할 수 있습니다. 하지만, wp-graphql의 경우 아직 Prerelease 단계인 탓인지 Github에서 직접 다운로드 받아 서버에 파일을 복사하여 설치를 하여야 하고 이에 대한 내용은 관련 문서에 자세히 설명되어 있어 공식 문서를 참고하여 서버에 직접 설치 하였습니다.

> [Install and Activate](https://docs.wpgraphql.com/getting-started/install-and-activate/)

## 1. Next.js에서 데이터 호출

Next.js 9.3이 업데이트 되면서 [Static Site Generation(SSG)](https://nextjs.org/blog/next-9-3#next-gen-static-site-generation-ssg-support)에 대한 부분이 업데이트 되었고 새롭게 추가된 [getStaticProps](https://nextjs.org/docs/basic-features/data-fetching)에서 CMS 데이터를 호출할 수 있도록 관련 문서에도 자세히 설명되어 있습니다.

처음에는 `/blog/[slug].tsx` 파일에서 데이터만 호출하면 되겠지 싶은 생각에 데이터를 호출해서 Rendering 할 생각만 했지만 역시 문서를 자세히 안 보면 손발이 고생합니다. 단순하게 정적 파일을 생성한다면 `getStaticProps` 만 있으면 되는게 맞습니다. 하지만, 블로그는 `[slug].tsx`라는 파일 명에서 알 수 있듯이 Dynamic Routes를 이용해 Rendering 하는 것이고 Next.js 문서에도 나와 있지만 [Dynamic Routes](https://nextjs.org/docs/routing/dynamic-routes)에서 getStaticProps를 사용한다면 [`getStaticPaths`](https://github.com/zeit/next.js/blob/master/errors/invalid-getstaticpaths-value.md)가 함께 만들어 져야 합니다.

getStaticPaths에 들어가야 할 데이터도 GraphQL의 Query를 작성하여 호출하는 것으로 해결 하였습니다. GraphQL에서 블로그 글의 Slug만 받아올 수 있는 Query를 작성하여 데이터를 호출하고 slug만 Array에 따로 담아 반환하였습니다.

```typescript
const query = /* GraphQL */ `
  query GET_SLUGS {
    posts {
      edges {
        node {
          slug
        }
      }
    }
  }
`;

export async function getSlugPaths(prefix) {
  const data = await request(endpoint, query, {});
  return data.posts.edges
    .map((post) => `${prefix}/${post.node.slug}`);
}
```

```typescript /blog/[slug].tsx
export async function getStaticPaths() {
  const paths = await getSlugPaths('/blog');
  return {
    paths,
    fallback: true,
  };
}
```

## 2. 글 목록 보여주기

글 목록을 불러오기 위해서는 /blog/index.tsx 파일에서 글의 목록만 가져올 수 있는 Query를 별도로 작성 하였습니다. 아직은 글이 많지 않아 Query가 단순하지만 pageinfo를 추가로 활용하면 페이징 처리도 충분히 가능할 것 같습니다.

```typescript
const query = /* GraphQL */ `
  query GET_POSTS {
    posts {
      nodes {
        id
        title
        excerpt
        slug
        date
      }
    }
  }
`;

export async function getPosts () {
  const data = await request(query);
  return data.posts.nodes;
}
```

```typescript /blog/[slug].tsx
export async function getStaticProps() {
  const posts = await getPosts();
  return {
    props: {
      posts,
    },
  };
}
```

## 3. 글을 가져와서 보여주기

글을 가져와서 보여주기만 하는 것은 글 목록을 보여주는 것과 같이 Query를 통해 손쉽게 불러와서 보여줄 수 있습니다.

```typescript
const query = /* GraphQL */ `
  query GET_POST($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      content
      slug
    }
  }
`;

export async function getPost(prefix) {
  const { post } = await request(endpoint, query, { slug });
  return post;
}
```

```typescript /blog/[slug].tsx
export async function getStaticProps({ params }) {
  const post = await getPost({ slug: params.slug });
  return {
    props: { post },
  };
};
```

다만, 호출한 글을 가져와서 보여주는 부분에서 특히 위와 같이 코드를 Highlight 처리해서 보여주고자 할 때에는 Highlight.js나 Prism과 같은 라이브러리를 이용해서 처리해야 합니다.

Markdown을 처리할 때에는 MDX나 Remark를 이용하면 되지만 HTML은 Remark와 똑같이 사용할 수 있는 Rehype를 이용해서 처리 했습니다. Rehype는 HTML를 처리하는 라이브러리로 Remark와 함께 만들어졌기 때문에 관련 플러그인이 다양합니다.

React에서 Code Block을 처리할 때에는 [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer)를 많이 사용합니다. 이미 많은 곳에서 쓰이는 것을 봤고 [Docusaurus](https://docusaurus.io) 테마에서도 사용하고 있습니다. HTML을 React로 변환하고 여기서 `<code>`태그를 [Prism.js](https://prismjs.com)로 처리하기 위해 [rehype-react](https://github.com/rehypejs/rehype-react)를 사용하였습니다.

rehype-react의 `components` 옵션을 사용하면 특정한 태그를 React 컴포넌트로 대체할 수 있습니다. MDXProvider를 사용해보신 분이라면 익숙하실 텐데 동일한 방법으로 적용할 수 있습니다.

```typescript
import React from 'react';
import rehype from 'rehype';
import rehype2react from 'rehype-react';
import CodeBlock from '../CodeBlock';

const processor = rehype()
  .data('settings', { fragment: true })
  .use(rehype2react, {
    createElement: React.createElement,
    components: {
      code: CodeBlock,
    },
  });

export const WPContent = ({ value }) => {
  return (
    <div className={styles.content}>
      {processor.processSync(value).result}
    </div>
  );
};

export default WPContent;
```

WordPress에서는 별도의 Plugin을 사용하지 않으면 Code Block을 사용할 때 Code의 언어를 지정할 수 없습니다. 이를 보완하기 위해 C[ode Syntax Block](https://wordpress.org/plugins/code-syntax-block/)이라는 Plugin를 이용했습니다. 여러가지 관련 라이브러리를 찾아 보았지만 일단 단순하면서 제가 원하는 Code 언어를 선택하는 기능으로만 활용하기에는 적당 했습니다.

## 마치며

혹시 의문을 가지실 수도 있습니다. 왜 굳이 어렵게 WordPress와 Next.js를 사용해서 블로그를 만드는지를 말이죠. 글이 많지는 않았지만 WordPress 블로그를 오랜 기간 운영했었지만 프론트엔드 개발자로 일을 하면서 PHP보다는 JavaScript가 그리고 React와 Next.js가 더 익숙 했습니다.

그런 이유로 WordPress는 CMS 도구로서만 이용을 하고 화면을 구성하는 것은 더 익숙한 Next.js를 이용해서 블로그를 만들게 되었습니다. 물론, WordPress에서 글을 작성한 후에 글을 Publish 하기 위해서는 Redeploy 과정을 한번 더 거쳐야 하고 번거로운 점도 많지만 Next.js를 이용하여 익숙한 기술로 화면을 자유롭게 만들 수 있는 점은 제게는 큰 매력으로 다가 왔습니다.

이번에 블로그를 만들면서 알게된 것이지만 WordPress에서 GraphQL로서 활용하는 방법도 있지만 [WP-API](https://github.com/WP-API)라는 프로젝트도 있었고 [node-wpapi](https://github.com/WP-API/node-wpapi)를 활용하면 GraphQL로 가져오는 방법보다 더 쉽게 가져올 수도 있고 인증을 처리하는 방법도 제공합니다.

이외에 WordPress 자체가 워낙에 다양하게 많이 이용되다 보니 활용할만한 것들이 꽤 많았습니다. 비슷한 고민을 하고 계신 분들께 도움이 되었으면 합니다.

## 관련 링크

- https://www.wpgraphql.com/
- http://v2.wp-api.org/
- https://github.com/WP-API/node-wpapi
- https://github.com/rehypejs/rehype
- https://github.com/rehypejs/rehype-react
- https://github.com/FormidableLabs/prism-react-renderer
