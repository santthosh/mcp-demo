declare module '@modelcontextprotocol/sdk/server' {
  import { z } from 'zod';

  export interface ServerInfo {
    name: string;
    version: string;
  }

  export interface ServerOptions {
    capabilities?: {
      tools?: boolean;
      resources?: boolean;
      prompts?: boolean;
      sampling?: boolean;
      logging?: boolean;
    };
    instructions?: string;
  }

  export interface MCPRequest<T = any> {
    params: T;
    method: string;
  }

  export interface MCPResponse<T = any> {
    result: T;
  }

  export class Server {
    constructor(serverInfo: ServerInfo, options?: ServerOptions);

    setRequestHandler<T = any, R = any>(
      method: string,
      handler: (request: MCPRequest<T>) => Promise<MCPResponse<R>>
    ): void;

    createRequestHandler(): (req: Request) => Promise<Response>;

    handleRequest(params: any): Promise<Response>;
  }
}

declare module '@modelcontextprotocol/sdk/server/stdio' {
  export class StdioTransport {
    constructor();
  }
}

declare module '@modelcontextprotocol/sdk/server/mcp' {
  import { z } from 'zod';
  import { Server } from '@modelcontextprotocol/sdk/server';
  import { StdioTransport } from '@modelcontextprotocol/sdk/server/stdio';

  export interface ServerInfo {
    name: string;
    version: string;
  }

  export interface ServerOptions {
    capabilities?: {
      tools?: boolean;
      resources?: boolean;
      prompts?: boolean;
      sampling?: boolean;
      logging?: boolean;
    };
    instructions?: string;
  }

  export interface ToolResponse {
    content: Array<{
      type: string;
      text: string;
    }>;
  }

  export class McpServer {
    constructor(serverInfo: ServerInfo, options?: ServerOptions);

    server: Server;

    connect(transport: StdioTransport): Promise<void>;

    tool<T extends Record<string, z.ZodType>>(
      name: string,
      description: string,
      parameters: T,
      handler: (params: { [K in keyof T]: z.infer<T[K]> }) => Promise<ToolResponse>
    ): void;
  }
} 