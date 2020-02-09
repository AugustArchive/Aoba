import { Aoba, MessageCollector } from '.';

export interface ArgumentInfo {
  label: string;
  type: string;
  prompts: {
    failed: string;
    start: string;
  };
}