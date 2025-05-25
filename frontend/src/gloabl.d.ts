declare namespace JSX {
    interface IntrinsicElements {
      'gmpx-placeautocomplete': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        placeholder?: string;
      };
    }
  }
  