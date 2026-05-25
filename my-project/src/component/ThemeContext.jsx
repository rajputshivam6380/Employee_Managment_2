import {
  useEffect,
  useMemo,
  useState,
} from "react";

import CssBaseline from "@mui/material/CssBaseline";

import {
  createTheme,
  ThemeProvider,
} from "@mui/material/styles";

import { ThemeModeContext } from "../theme/themeMode";

export default function ThemeWrapper({
children,
}) {

const [mode, setMode] =
useState(() =>
localStorage.getItem("theme") ||
"light"
);

const toggleTheme =
() => {

const newMode =

mode ===
"light"

?

"dark"

:

"light";

setMode(
newMode
);

};

useEffect(() => {

document.documentElement.classList.toggle(
"dark",
mode === "dark"
);

localStorage.setItem(
"theme",
mode
);

}, [mode]);

const theme =
useMemo(
()=>

createTheme({

palette:{

mode,

primary:{
main:
"#6366F1"
},

background: {
default:
mode === "dark"
? "#0f172a"
: "#f9fafb",
paper:
mode === "dark"
? "#111827"
: "#ffffff",
},

},

typography: {
fontFamily: "Poppins, sans-serif",
},

}),

[mode]
);

return (

<ThemeModeContext.Provider
value={{
mode,
toggleTheme
}}
>

<ThemeProvider
theme={
theme
}
>

<CssBaseline />

{
children
}

</ThemeProvider>

</ThemeModeContext.Provider>

);

}
