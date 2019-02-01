module Particle = {
  type spacer_size =
    | XS
    | S
    | M
    | L
    | XL;

  type feedback_state =
    | Default
    | Error;

  type font_weight =
    | Regular
    | Bold;

  type font_size =
    | Main
    | Detail
    | Body
    | Code;

  type font_family =
    | Mono
    | Sans;

  type color = [ | `Black | `Error | `Gray | `White];
};

module Atom = {
  module Background = {
    type t = {color: Particle.color};
  };
  /*
   * Search Field — Background
   * Search Field — Border
   * Example — Code — Background
   */
  module Text: {
    type t;

    type main_color = [ | `Black | `White | `Error];

    type style =
      | Main(main_color)
      | Detail
      | Body
      | Example_code
      | Example_title;

    let make: style => t;
  } = {
    type main_color = [ | `Black | `White | `Error];

    type style =
      | Main(main_color)
      | Detail
      | Body
      | Example_code
      | Example_title;

    type t = {
      size: Particle.font_size,
      weight: Particle.font_weight,
      family: Particle.font_family,
      color: Particle.color,
    };

    let make = style => {
      Particle.(
        switch (style) {
        | Main(color) => {
            color: (color :> Particle.color),
            size: Main,
            weight: Regular,
            family: Mono,
          }
        | Detail => {
            color: Black,
            size: Detail,
            weight: Regular,
            family: Sans,
          }
        | Body => {color: Black, size: Body, weight: Regular, family: Sans}
        | Example_code => {
            color: White,
            size: Code,
            weight: Regular,
            family: Mono,
          }
        | Example_title => {
            color: Black,
            size: Body,
            weight: Bold,
            family: Sans,
          }
        }
      );
    };
  };

  module Spacer: {
    type t;

    let make:
      (~width: Particle.spacer_size, ~height: Particle.spacer_size) => t;
  } = {
    type t = {
      width: Particle.spacer_sizes,
      height: Particle.spacer_sizes,
    };

    let make = (~width, ~height) => {width, height};
  };
};

/**

# Components (Molecules)

* Search Field
* Main Title
* Detail Text (The one in the home page)
* Body Text (main description of command)
* Example


*/;
