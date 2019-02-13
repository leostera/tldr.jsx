module Style = ReactDOMRe.Style;

module Particle = {
  let spacer_size =
    fun
    | `XS => "5px"
    | `S => "10px"
    | `M => "15px"
    | `L => "20px"
    | `XL => "25px";

  let feedback_state =
    fun
    | `Default
    | `Error => true;

  let font_weight =
    fun
    | `Regular => "400"
    | `Bold => "600";

  let font_size =
    fun
    | `Main => (`Font_size("40px"), `Line_height("50px"))
    | `Detail => (`Font_size("15px"), `Line_height("20px"))
    | `Body => (`Font_size("24px"), `Line_height("30px"))
    | `Code => (`Font_size("20px"), `Line_height("30px"));

  let font_family =
    fun
    | `Mono => "Roboto Mono, Menlo, monospace"
    | `Sans => "Helvetica, Arial, sans-serif";

  let color =
    fun
    | `Black => "#000000"
    | `Error => "#EF0000"
    | `Gray => "#616161"
    | `White => "#FFFFFF";
};

module Atom = {
  module Spacer = {
    let to_css: Design_system.Atom.Spacer.t => Style.t =
      size => {
        let size' = size |> Particle.spacer_size;
        Style.make(~width=size', ~height=size', ());
      };
  };

  module Border = {
    let to_css: Design_system.Atom.Border.t => Style.t =
      ({color}) => {
        Style.make(~borderColor=color |> Particle.color, ());
      };
  };

  module Text = {
    let to_css: Design_system.Atom.Text.t => Style.t =
      ds_style => {
        switch (Design_system.Atom.Text.view(ds_style)) {
        | {size, weight, family, color} =>
          let (`Font_size(font_size), `Line_height(line_height)) =
            size |> Particle.font_size;
          Style.make(
            ~color=color |> Particle.color,
            ~fontFamily=family |> Particle.font_family,
            ~fontSize=font_size,
            ~lineHeight=line_height,
            ~fontWeight=weight |> Particle.font_weight,
            (),
          );
        };
      };
  };
};
