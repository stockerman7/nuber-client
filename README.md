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

- 우선 ApolloClient 객체에서 request 을 설정한다. 이 request 는 비동기 메소드이다. 클라이언트 측에서 요청할 때마다 클라이언트 Top-Level 설정에서 Mutation, Query 를 가로챈다.
- apollo-boost 에서 { Operation } 을 가져오고 Operation 타입의 인자인 operation 을 비동기로 받는다.
- 그 operation 속성으로 setContext 함수가 있다. 그 함수는 localhost 를 통해 전달된 JWT headers 를 받아 처리한다.