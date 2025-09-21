import { useEffect, useState } from "react";

function useBreakpointValue(values) {
  const [val, setVal] = useState(values.base);
  useEffect(() => {
    const md = window.matchMedia("(min-width: 768px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      setVal(lg.matches ? (values.lg ?? values.md ?? values.base)
                        : md.matches ? (values.md ?? values.base)
                        : values.base);
    };
    update();
    md.addEventListener("change", update);
    lg.addEventListener("change", update);
    return () => { md.removeEventListener("change", update); lg.removeEventListener("change", update); };
  }, [values]);
  return val;
}
