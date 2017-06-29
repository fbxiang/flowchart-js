import { Node } from './node';

export type NodeClass = {name: string, nodeClass: new () => Node };
export type OptionList =  {name: string, options: Option[]};
export type Option = NodeClass | OptionList;

export class Menu {
  static instance = new Menu();
  options: Option[] = [];
  constructor() {}

  addOption(name: string) {
    if (this.options.filter(option => option.name == name).length > 0)
      return;
    this.options.push({name, options: []});
  }

  addNodeClassToOption(nodeName: string, nodeClass: new() => Node, optionName: string) {
    let option = this.options.filter(option => option.name == optionName)[0] as OptionList;
    if (option && option.options.filter(node => node.name == nodeName).length == 0) {
      option.options.push({name: nodeName, nodeClass: nodeClass});
    }
  }

  search(keyword: string, options=this.options) {
    keyword = keyword.toLowerCase();
    let results = [];
    for (let option of options) {
      if ((option as OptionList).options) {
        results = results.concat(this.search(keyword, (option as OptionList).options));
      } else if (option.name.toLowerCase().includes(keyword)) {
        results.push(option);
      }
    }
    return results;
  }
}
