module Particle = {
  type spacer_size = [ | `XS | `S | `M | `L | `XL];

  type feedback_state = [ | `Default | `Error];

  type font_weight = [ | `Regular | `Bold];

  type font_size = [ | `Main | `Detail | `Body | `Code];

  type font_family = [ | `Mono | `Sans];

  type color = [ | `Black | `Error | `Gray | `White];
};

module Atom = {
  module Background: {
    type t;
    type view = {color: Particle.color};
  } = {
    type t = {color: Particle.color};
    type view = {color: Particle.color};
  };

  module Border = {
    /* TODO(@ostera): Constructor + View */
    type t = {color: Particle.color};
    let make = state =>
      switch (state) {
      | `Default => {color: `Black}
      | `Error => {color: `Error}
      };
  };

  module Text: {
    type t;

    type view = {
      size: Particle.font_size,
      weight: Particle.font_weight,
      family: Particle.font_family,
      color: Particle.color,
    };

    type main_color = [ | `Black | `Gray | `Error];

    type style =
      | Main(main_color)
      | Detail
      | Body
      | Example_code
      | Example_title;

    let make: style => t;

    let view: t => view;
  } = {
    type main_color = [ | `Black | `Gray | `Error];

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

    type view = {
      size: Particle.font_size,
      weight: Particle.font_weight,
      family: Particle.font_family,
      color: Particle.color,
    };

    let view: t => view =
      ({size, weight, family, color}) => {size, weight, family, color};

    let make: style => t =
      style => {
        switch (style) {
        | Main(color) => {
            color: (color :> Particle.color),
            size: `Main,
            weight: `Regular,
            family: `Mono,
          }
        | Detail => {
            color: `Black,
            size: `Detail,
            weight: `Regular,
            family: `Sans,
          }
        | Body => {
            color: `Black,
            size: `Body,
            weight: `Regular,
            family: `Sans,
          }
        | Example_code => {
            color: `White,
            size: `Code,
            weight: `Regular,
            family: `Mono,
          }
        | Example_title => {
            color: `Black,
            size: `Body,
            weight: `Bold,
            family: `Sans,
          }
        };
      };
  };

  module Spacer = {
    type t = Particle.spacer_size;
    let make = size => size;
  };
};
