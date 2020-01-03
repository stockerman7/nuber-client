import PropTypes from "prop-types";
import React from "react";

// Typescript 에서 interface 는 일반적으로 타입 체크를 위해 사용되며 변수, 함수, 클래스에 사용할 수 있다.
// https://poiemaweb.com/typescript-interface
interface IProps {
	isLoggedIn: boolean;
}

// SFC : Stateless Functional Component -> 다시 말해 함수형 컴포넌트, 일명 Hook 이라함
const AppPresenter: React.SFC<IProps> = ({ isLoggedIn }) =>
	isLoggedIn ? <span>you are in</span> : <span>you are out</span>;

// AppPresenter 에 isLoggedIn 라는 속성을 추가한다.
// 그리고 그 속성은 Bool 타입이며 필수이다.
AppPresenter.propTypes = {
	isLoggedIn: PropTypes.bool.isRequired,
};

export default AppPresenter;
