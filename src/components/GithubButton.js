//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import React from "react";

/*******************************************************************************
 * Type Definitions
 *******************************************************************************/

type Size = "small" | "large";
type Type = "fork" | "follow" | "star" | "watch";

type ButtonProps = {
  user: string,
  repository: string,
  size: Size,
  type: Type,
  count: boolean,
};

/*******************************************************************************
 * Public API
 *******************************************************************************/

export default ({ user, repository, size, type, count }: ButtonProps) => (
  <iframe
    className="github-iframe"
    src={`https://ghbtns.com/github-btn.html?user=${user}&repo=${repository}&type=${type}&count=${count}&size=${size}`}
    frameBorder="0"
    scrolling="0"
    width="160px"
    height="30px"
  ></iframe>
);
