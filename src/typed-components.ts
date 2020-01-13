import * as styledComponents from "styled-components/native";

interface IThemeInterface {
  primaryColor : string;
  primaryColorInverted : string;
}

const {
  default: styled,
  css,
  ThemeProvider
} = styledComponents as styledComponents.ReactNativeThemedStyledComponentsModule<IThemeInterface>;

export { css, ThemeProvider };
export default styled;