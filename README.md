# Nuber Client

## #2.0 Create React App with Typescript

`.gitignore` 은 비슷하다. 그러나 `tsconfig.json` 은 다르다.

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "outDir": "build/dist",
    "module": "commonjs",
    "target": "es5",
    "lib": ["es6", "dom", "esnext.asynciterable"],
    "sourceMap": true,
    "allowJs": true,
    "jsx": "react",
    "moduleResolution": "node",
    "rootDir": "src",
    "forceConsistentCasingInFileNames": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noImplicitAny": true,
    "importHelpers": true,
    "strictNullChecks": true,
    "suppressImplicitAnyIndexErrors": true,
    "noUnusedLocals": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "exclude": [
    "node_modules",
    "build",
    "scripts",
    "acceptance-tests",
    "webpack",
    "jest",
    "src/setupTests.ts"
  ]
}
```

- `import * as react` 처럼 하고 싶지 않다면 `"module" : "commonjs"` 처럼 한다.
- `"lib"` 속성은 `"esnext.asynciterable"` 을 추가한다.
- `"esModuleInterop"` 속성을 추가하고 `true` 한다.
- `"skipLibCheck"` 속성을 추가하고 `true` 한다.

그리고 `src` 디렉토리에 필요없는 나머지 파일들 `App.css`, `App.test.tsx`, `index.css`, `logo.svg` 등을 제거한다.

#### index.tsx
```ts
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
```

#### App.tsx
```tsx
import React from "react";

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
```

앱을 실행시켜보자.

```bash
$ yarn start
```

다음과 같이 http://localhost:3000/ 페이지가 나타난다.

----

## #2.1 Apollo Setup part One

```bash
$ yarn add apollo-boost graphql react-apollo
```

`src/apollo.ts` 파일을 만들고 다음과 같이 작성한다.

#### apollo.ts
```ts
import ApolloClient from "apollo-boost";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql"
});

export default client;
```

#### index.tsx
```tsx
import React from "react";
import { ApolloProvider } from "react-apollo";
import ReactDOM from "react-dom";
import client from "./apollo";
import App from "./App";

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root") as HTMLElement,
);
```

----

## #2.2 Apollo Setup part Two

Apollo 파트에서 두번째 설정은 바로 인증(Authentication)이다. 여기서 우리는 이전에 Nuber Server 작업에서 사용했던 JWT 를 사용할 것이다. 그런데 어떻게 서버와의 요청를 연결할 수 있을까? 그 코드는 다음과 같다.

#### apollo.ts
```ts
import ApolloClient, { Operation } from "apollo-boost";

const client = new ApolloClient({
  request: async(operation: Operation) => {
    operation.setContext({
      headers: {
        "X-JWT": localStorage.getItem("jwt") || ""
      }
    })
  },
  uri: "http://localhost:4000/graphql"
});

export default client;
```

Apollo 에는 아주 좋은 기능들이 있다. 그중에 서버로부터 들어오는 요청을 연결해 주는 옵션도 있다.

- 우선 `ApolloClient` 객체에서 `request` 을 설정한다. 이것은 우리 만들 모든 request 들에 JWT Token 을 적용시킨다. `request` 는 비동기 메소드이며 클라이언트 측에서 요청할 때마다 클라이언트 Top-Level 설정에서 Mutation, Query 를 가로챈다.
- `apollo-boost` 에서 `{ Operation }` 을 가져오고 `Operation` 타입의 인자인 `operation` 을 비동기로 받는다. 다른말로 모든 `operation` 은 `request` 객체에 접근할 수 있도록 허용한다.
- 그 `operation` 속성으로 `setContext` 함수가 있다. 그 함수는 `localhost` 를 통해 전달된 JWT headers 를 받아 처리한다.
- `uri` 는 GraphQL Endpoint 로 서버와 통신할 주소이다. 현재 서버는 local 인 점을 유념하자.

`ApolloClient` 설정에서 `headers` 설정은 매우 유용하다. `fetch` 함수를 사용해 일일이 헤더를 세팅하는 번거로운 작업을 하지 않아도 되기 때문이다.
----

## #2.3 Apollo Setup part Three

이제 Apollo 에서는 `ApolloClient` 로 `clientState` 를 자동으로 정의한다. 그래서 `clientState` 에서 기본설정(default) 해주는 방법에 관해 알아야 한다.

#### apollo.ts
```ts
import ApolloClient, { Operation } from "apollo-boost";

const client = new ApolloClient({
  clientState: {
    defaults: {
      auth: {
        __typename: "Auth",
        isLoggedIn: Boolean(localStorage.getItem("jwt")),
      },
    },
    resolvers: {
      Mutation: {
        logUserIn: (_, { token }, { cache }) => {
          localStorage.setItem("jwt", token);
          cache.writeData({
            data: {
              auth: {
                __typename: "Auth",
                isLoggedIn: true,
              },
            },
          });
          return null;
        },
        logUserOut: (_, __, { cache }) => {
          localStorage.removeItem("jwt");
          cache.writeData({
            data: {
              __typename: "Auth",
              isLoggedIn: false,
            },
          });
          return null;
        },
      },
    },
  },
  request: async (operation: Operation) => {
    operation.setContext({
      headers: {
        "X-JWT": localStorage.getItem("jwt") || "",
      },
    });
  },
  uri: "http://localhost:4000/graphql",
});

export default client;
```

- 우선 `clientStete` 속성을 만들고 거기에 `defaults` 를 설정한다. 그 `defaults` 는 `auth`(authorization: 인증) 라는 사용자가 지정한 객체 속성으로 `__typename`, `isLoggedIn` 를 가지고 있다. `__typename` 는 GraphQL 에서 처럼 Auth 라는 타입을 지정한 것이다. `isLoggedIn` 을 사용하는 이유는 사용자 로그인 여부를 알기 위해서다. `Boolean(localStorage.getItem("jwt"))` 처럼 `localStorage` 에서 `"jwt"` 라는 Key 로 값을 가지고 있는지 여부로 `Boolean` 함수로 감싼다. 결과적으로 `isLoggedIn` 은 Key 유무로 인해 `true`, `false` 값을 가질 것이다.
- 또 GraphQL 에서 처럼 Resolver 들을 추가할 수 있다. `Mutation` 속성으로 두개의 작업을 만든다. 하나는 사용자가 로그인 할 때 `logUserIn`, 다른 하나는 사용자가 로그아웃 할 때 `logUserOut` 이다. 그리고 이 메소드들은 `parent`, `arguments`, `context` 를 인자로 받는다.
- `logUserIn` 은 `context` 인자로 `{ token }` 을 받는다. 그리고 `localStorage.setItem("jwt", token)` 처럼 `localStorage` 에 `token` 을 저장하기 위해 `"jwt"` 라는 키를 생성한다. 그리고 `cache` 에 초기설정 값들(`defaults`)과 관련된 데이터인 `__typename`, `isLoggedIn` 을 수정한다.
- `logUserOut` 은 아주 간단하다. `localStorage` 에서 해당 `"jwt"` 키를 삭제하고 `cache` 데이터의 `isLoggedIn: false` 값으로 변경하기만 하면 로그아웃이 된다. 

이런식으로 `ApolloClient` 는 사용자의 State 를 변경할 수 있어 유용하다.

----

## #2.5 Connecting Local State to Components

먼저 `src/Components/App` 디렉토리를 생성한다(`src/App.tsx` 는 제거한다). 그 디렉토리에 다음과 같은 파일들과 코드들을 작성해보자.

#### index.ts
```ts
import AppContainer from "./AppContainer";
export default AppContainer;
```

index.tsx 에도 새로 생성된 App 을 연결해야 한다.

#### index.tsx
```tsx
import React from "react";
import { ApolloProvider } from "react-apollo";
import ReactDOM from "react-dom";
import client from "./apollo";
import App from "./Components/App"; // 새롭게 적용된 부분

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root") as HTMLElement,
);
```

그러면 index.tsx 는 Components/App 디렉토리에 index.ts 를 찾아간다. index.ts 는 AppContainer.tsx 모듈을 알고 있기 때문에 연결된다. 그런데 어떻게 AppContainer 에게 로그인 여부를 전달 할 수 있을까? 다음 AppContainer 와 AppQueries 를 같이 보도록 하자.

#### AppContainer.tsx
```tsx
import React from "react";
import { graphql } from "react-apollo";
import { IS_LOGGED_IN } from "./AppQueries";

const AppContainer = ({ data }) => <div>{JSON.stringify(data)}</div>; 

export default graphql(IS_LOGGED_IN)(AppContainer);
```

#### AppQueries.ts
```ts
import { gql } from "apollo-boost";

export const IS_LOGGED_IN = gql`
  {
    auth {
      isLoggedIn @client
    }
  }
`;
```


- AppContainer 에서는 react-apollo 모듈에서 GraphQL 을 사용하기 위해 graphql 객체를 불러온다.
- AppQueries 에서는 apollo-boost 모듈에서 gql 객체를 불러와 graphql tag 들을 사용할 것이다. 이 graphql query tag 를 이용해서 로그인 여부를 조회한다. apollo.ts 에서 설정 값으로 준 auth 속성을 사용해 조회하면 API(여기서는 Nuber 를 일컬음) 에서 자동으로 쿼리가 실행된다. 하지만 API 에는 auth 라는 resolver 는 존재하지 않는다. 그 resolver 는 우리가 apollo.ts 의 ApolloClient 생성자에서 clientState 속성에 auth 를 localStorage 안에 들어가도록 설정했다. 그래서 localStorage 에 있는 것을 가져오려면 로컬에 있다는 것을 알려줘야 하기 때문에 isLoggedIn @client 을 적용한다. 결과적으로 API 에 Query 를 보내지 않고 cache 로 보내게 된다. 그리고 그 cache 에서 로그인 유무를 알려준다.
- 그럼 AppContainer 의 export default graphql(IS_LOGGED_IN)(AppContainer) 작동방식을 이해할 수 있다. graphql 함수로 IS_LOGGED_IN 인자를 받는데 그것은 Query 데이터 결과일 것이다. 그럼 그 결과는 다음 인자로 다시 전달되는데 const AppContainer = ({ data }) => { ... } 처럼 가공된 결과일 것이다.

client 앱을 실행해보자.

```bash
$ yarn start 
```

<img src="" width="" alt="">

위 그림처럼 `"auth":{"isLoggedIn":false, ...}` 나타난 것을 볼 수 있다. 로그인 여부를 확인할 수 있다. 지금까지 client 측에서의 resolver 사용법을 간략하게 알아보았다.

----

