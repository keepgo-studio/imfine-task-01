# [아이엠파인] 인터랙티브 막대 차트 어플리케이션

> **개발 시간:** 약 15시간  
> **목표:** HTML 기본 엘리먼트만 사용하여 인터랙티브 막대 차트 어플리케이션 구현  

---

## 📁 **프로젝트 파일 구조**

```bash
.
├── index.css                  # 제출물 1
├── index.html                 # 제출물 2
├── jsconfig.json              # @ts-check을 위해 만듬
├── main.js                    # 제출물 3
├── package.json               # CORS 이슈를 피하기 위해 번들링 사용
├── README.md
└── src
```

## src structure

```bash
src
├── app
│   ├── App.js                 # 최상위 앱 컴포넌트
│   ├── components             # UI 컴포넌트 모음
│   │   ├── BarChart.js        # 막대 차트 컴포넌트
│   │   ├── Container.js       # 레이아웃 컨테이너 컴포넌트
│   │   ├── DataTable.js       # 데이터 테이블 컴포넌트
│   │   ├── Divider.js         # 구분선 컴포넌트
│   │   ├── Editor.js          # 데이터 편집기 컴포넌트
│   │   ├── Graph.js           # 그래프 컴포넌트 (차트를 렌더링하는 곳)
│   │   └── RawEditor.js       # JSON 편집기 컴포넌트
│   ├── config                 # 설정 파일 모음
│   │   ├── component.js       # Component core 정의
│   │   ├── styles.js          # 스타일 유틸리티
│   │   └── utils.js           # 일반 유틸리티 함수
│   ├── model                  # 데이터 모델
│   │   └── Data.js            # 데이터 관리 모델 클래스
│   └── pages                  # 페이지 정의
│       ├── Home.js            # 메인 페이지
│       └── NotFound.js        # 404 페이지
└── index.js                   # 진입점
```

# 개요

본프로젝트는 오로지 Javascript만으로 구현했습니다. 다만 로컬 파일로 여는 테스트 조건에 부합하기 위해(= CORS issue occur) esbuild로 간단하게 번들링을 했습니다.

Chart js, D3 등의 시각 라이브러리, 그리고 여러 프레임워크들(NextJS, Vue, Gatsby, ...)을 경험해보았기에 저의 강점을 보여주고자 디테일하게 프로젝트를 구현해 보았습니다.

그중 Web API을 적극적으로 활용하는 Lit 라이브러리에 영감을 얻어 Lit과 유사한 문법을 가지는 저 자신만의 컴포넌트 라이브러리를 구축했습니다. (check `src/app/config` folder)

Virtual DOM 개념까지는 적용하지 못해서 리렌더링하는 부분이 조금 비효율적이지만, 지금 구현한 것만으로도 모듈화, 코드 유연성, 프로젝트 확장성 등을 고려한다는 것을 코드를 통해 알 수 있습니다.

## 주요 기능

1. Graph UI

    데이터를 시각화하여 막대 그래프로 표현 

    chart에 약간의 애니메이션 추가

    ⭐️ 음의 실수, 양의 실수 모두 지원

    (현재 BarChart 지원)

2. 값 편집

    약간의 MVC 개념을 차용함. DataModel class(`src/app/model/Data.js`)를 구독하는 component들은 데이터가 변경될 때마다 리렌더링하게 구현

    JSON Editor로 값 수정 가능

## 더 추가한 기능, 및 특징

* SPA 설계 & 라우팅 기능

* 컴포넌트 설계로 확장성 및 유연성을 끌러올림

* shadowDom을 이용하여 스타일 캡슐화

* `// @ts-check` 을 적극적으로 활용해 타입 체킹 가능

## code rules

1. tag prefix rules

    custom tag들은 상속받은 Component의 이름을 따라간다

    - `app-* => Component`

        ```js
        // src/app/components/BarChart.js
        class BarChart extends Component {
            ...
        }

        <app-bar-chart></app-bar-chart>
        ```

    - `app-page-* => PageComponent`

        ```js
        // src/app/pages/Home.js
        class Home extends PageComponent {
            ...
        }

        <app-page-home></app-page-home>
        ```

2. component import rules

    custom element들은 index.js에서만 import할 것(`src/app/index.js`)

## design

figma로 간단하게 작업하여 이를 토대로 css 작업을 했습니다.

https://www.figma.com/design/8YbkacBF9fZKZn6tibqdVk/imfine?node-id=0-1&t=d4umo430hjzRQjaQ-1