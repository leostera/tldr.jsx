//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import React from "react";

/*******************************************************************************
 * Public API
 *******************************************************************************/

export default () => (
  <div>
    <section
      style={{
        margin: "10px auto",
        color: "#001d15",
        textAlign: "center",
        display: "inline-flex",
        justifyContent: "center",
        flexWrap: "wrap",
        width: "100%",
      }}
    >
      <span style={{ padding: "10px" }}>
        If this web site has been useful to you, consider supporting me on
        Patreon
      </span>
      <span>
        <a
          style={{
            display: "inline-block",
          }}
          href="https://www.patreon.com/AbstractMachines"
        >
          <img
            alt="Become a Patron"
            src="https://c5.patreon.com/external/logo/become_a_patron_button.png"
            width="130px"
          />
        </a>
      </span>
    </section>
  </div>
);
