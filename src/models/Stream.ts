export class Stream {
  constructor(public readonly id: number,
              public readonly name: string,
              public feed: any = null,
              public volume: number = 0,
              public speaker: boolean = false,
              public isScreen: boolean = false,
              public isSelected: boolean = false) {
  }

  //open talk mock
  public stream: any;
  public connData: any;
}
