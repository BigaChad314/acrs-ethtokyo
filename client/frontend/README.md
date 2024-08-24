# 기획

## 기능

1. 포인트 주기
2. 각 노드별 reputation, importance 보여주기
3. 랜덤 노드 4개끼리 머클루트 비교해서 무결성 보증
4. 패널티 
5. 확인 팝업 (컴포넌트 구현 o, 디자인 x, flow x)
6. 지갑 연결

## Flow

### 일반 reputation 로직

1. reputation 점수 부여
2. reputation 증가한 것 보이기
3. importance에 영향을 끼친것을 보여주기

### 경제 로직

1. 시간이 지나면 지갑별로 팝업 띄워서 머클 루트 계산 유도
2. 계산을 하면 정해진 양을 스테이킹

### 경제 로직 결과 확인

1. 틀렸을 때, 슬래싱 당한 것을 보여주기
2. 맞았을 때, 보상 받는 것을 보여주기


## Page

1. 그래프 페이지 + 지갑 연결
2. 리스트 페이지


## popup

1. 그래프 페이지 + reputation 점수를 주는 팝업 + 스테이킹 팝업, 머클 루트 계산 및 확인 팝업, 틀렸을 때 패널티 팝업
2. 노드 별 reputation과 importance를 progress bar로 보여주는 리스트 페이지 하나 (+alpha)






# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
