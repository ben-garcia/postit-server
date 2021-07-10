import { Request, Response } from 'express';

export interface MyContext {
  req: Request & { username: string };
  res: Response;
}

export type CommunityContentSort = 'Hot' | 'Rising' | 'New' | 'Top';
export type ChatRequestsFrom = 'Everyone' | '30 days' | 'Nobody';
export type PrivateMessageFrom = Exclude<ChatRequestsFrom, '30 days'>;
