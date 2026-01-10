/**
 * Entité Marketing représentant une publicité.
 * Simple interface car pas de logique métier complexe pour l'instant.
 *
 * @interface Ad
 */
export interface AdProps {
  id: string;
  title: string;
  type: 'SPONSORED';
  url: string;
}

export class Ad {
  public readonly id: string;
  public readonly title: string;
  public readonly type: 'SPONSORED';
  public readonly url: string;

  constructor(props: AdProps) {
    this.id = props.id;
    this.title = props.title;
    this.type = props.type;
    this.url = props.url;
  }
}
