export interface GameProps{
    initialDrawId: string;
    credits: number;
    betAmount: number;
    gameHistory: updatedHistory[];
    onBet: (drawId: string) => void;
}


export  type InputAction = {
    half: string;
    double: string;
    select: boolean;
}

export type updatedHistory = {
    drawId: string;
    betAmount: number;
    multiplier: number;
    win: number;
}

export type VukaTBetHistory =  {
    Multiplier: string;
    WinAmount: string;
}
