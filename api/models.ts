
export interface User {
	name: string;
	openId: string;
	sessionId: string;
	ymUserId: string;
	consent: boolean;
	threshold: number;
	enabled: boolean;
	signPay: boolean
	applyId: string;
}
