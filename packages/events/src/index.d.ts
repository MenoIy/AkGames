export declare const EVENTS: {
    readonly CONNECT: "connect";
    readonly DISCONNECT: "disconnect";
    readonly GAME_START: "game:start";
    readonly GAME_END: "game:end";
    readonly GAME_UPDATE: "game:update";
    readonly PLAYER_JOIN: "player:join";
    readonly PLAYER_LEAVE: "player:leave";
    readonly PLAYER_MOVE: "player:move";
    readonly ERROR: "error";
};
export type EventKey = keyof typeof EVENTS;
export type EventValue = (typeof EVENTS)[EventKey];
//# sourceMappingURL=index.d.ts.map