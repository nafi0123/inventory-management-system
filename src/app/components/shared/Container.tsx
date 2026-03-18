import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const Container = ({ children }: Props) => {
  return <div className="max-w-[1200px] mx-auto">{children}</div>;
};

export default Container;