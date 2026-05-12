export interface User {
    id: string;
    username: string;
    avatar?: string;
}
export interface Game {
    id: string;
    status: 'waiting' | 'playing' | 'ended';
    players: User[];
    createdAt: string;
}
export interface ApiResponse<T> {
    data: T;
    message?: string;
}
export interface ApiError {
    statusCode: number;
    message: string;
}
//# sourceMappingURL=index.d.ts.map