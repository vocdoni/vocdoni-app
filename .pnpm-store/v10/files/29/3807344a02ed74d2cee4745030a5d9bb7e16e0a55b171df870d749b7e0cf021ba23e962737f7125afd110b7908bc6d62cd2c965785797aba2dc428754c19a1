type FileMessage = {
    url: string;
    type: string;
    name: string;
};
type AnimationMessage = {
    url: string;
    type: string;
};
type AudioMessage = {
    url: string;
    type: string;
    duration: number;
};
type PickerMessage = {
    id: string;
    text: string;
    choices: PickerMessageChoices[];
};
type PickerMessageChoices = {
    value: string;
    label: string;
    selected: boolean;
};
type FieldMessage = {
    id: string;
    text: string;
    explain: string;
};
type CarouselMessageTargets = {
    title: string;
    description?: string;
    image?: string;
    actions: CarouselMessageTargetsActions[];
};
type CarouselMessageTargetsActions = {
    label: string;
    url: string;
};
type CarouselMessage = {
    text: string;
    targets: CarouselMessageTargets[];
};
declare class CrispMessage {
    private parent;
    constructor(crisp: Crisp);
    setMessageText(content: string): void;
    send(type: string, content: string | FileMessage | AnimationMessage | AudioMessage): void;
    sendText(content: string): void;
    sendFile(content: FileMessage): void;
    sendAnimation(content: AnimationMessage): void;
    sendAudio(content: AudioMessage): void;
    show(type: string, content: string | FileMessage | AnimationMessage | AudioMessage | FieldMessage | PickerMessage | CarouselMessage): void;
    showText(content: string): void;
    showFile(content: FileMessage): void;
    showAnimation(content: AnimationMessage): void;
    showAudio(content: AudioMessage): void;
    showPicker(content: PickerMessage): void;
    showField(content: FieldMessage): void;
    showCarousel(content: CarouselMessage): void;
    markAsRead(): void;
    startThread(name: String): void;
    endThread(name?: String): void;
    onMessageSent(callback: Function): void;
    offMessageSent(): void;
    onMessageReceived(callback: Function): void;
    offMessageReceived(): void;
    onMessageComposeSent(callback: Function): void;
    offMessageComposeSent(): void;
    onMessageComposeReceived(callback: Function): void;
    offMessageComposeReceived(): void;
}

type CompanyData = {
    url?: string;
    description?: string;
    employment?: CompanyDataEmployment | string[];
    geolocation?: CompanyDataGeolocation | string[];
};
type CompanyDataEmployment = {
    title: string;
    role?: string;
};
type CompanyDataGeolocation = {
    country: string;
    city?: string;
};
declare class CrispUser {
    private parent;
    constructor(crisp: Crisp);
    setNickname(nickname: string): void;
    setEmail(email: string, hmac?: string): void;
    setPhone(phone: string): void;
    setAvatar(avatar: string): void;
    setCompany(name: string, data: CompanyData): void;
    getEmail(): string | null;
    getPhone(): string | null;
    getNickname(): string | null;
    getAvatar(): string | null;
    getCompany(): object | null;
    onEmailChanged(callback: Function): void;
    offEmailChanged(): void;
    onPhoneChanged(callback: Function): void;
    offPhoneChanged(): void;
    onNicknameChanged(callback: Function): void;
    offNicknameChanged(): void;
    onAvatarChanged(callback: Function): void;
    offAvatarChanged(): void;
}

declare class CrispTrigger {
    private parent;
    constructor(crisp: Crisp);
    run(name: string): void;
}

declare enum EventsColors {
    Red = "red",
    Orange = "orange",
    Yellow = "yellow",
    Green = "green",
    Blue = "blue",
    Purple = "purple",
    Pink = "pink",
    Brown = "brown",
    Grey = "grey",
    Black = "black"
}
declare class CrispSession {
    private parent;
    constructor(crisp: Crisp);
    reset(reload?: boolean): void;
    setSegments(segments: string[], overwrite: boolean): void;
    setData(data: object): void;
    pushEvent(name: string, data?: object, color?: EventsColors): void;
    getData(key: string): string | boolean | number | undefined;
    getIdentifier(): string | null;
    onLoaded(callback: Function): void;
    offLoaded(): void;
    private isValidDataValue;
}

declare class CrispChat {
    private parent;
    constructor(crisp: Crisp);
    show(): void;
    hide(): void;
    open(): void;
    close(): void;
    setHelpdeskView(): void;
    openHelpdeskArticle(locale: string, slug: string, title?: string, category?: string): void;
    queryHelpdesk(query: string): void;
    unreadCount(): number;
    isChatOpened(): boolean;
    isVisible(): boolean;
    onChatInitiated(callback: () => void): void;
    offChatInitiated(): void;
    onChatOpened(callback: () => void): void;
    offChatOpened(): void;
    onChatClosed(callback: () => void): void;
    offChatClosed(): void;
    onHelpdeskQueried(callback: Function): void;
    offHelpdeskQueried(): void;
}

declare global {
    var $crisp: any;
    var CRISP_WEBSITE_ID: string;
    var CRISP_TOKEN_ID: string;
    var CRISP_RUNTIME_CONFIG: any;
    var CRISP_COOKIE_DOMAIN: string;
    var CRISP_COOKIE_EXPIRE: number;
}
type Options = {
    clientUrl?: string;
    autoload?: boolean;
    tokenId?: string;
    locale?: string;
    sessionMerge?: boolean;
    cookieDomain?: string;
    cookieExpire?: number;
    lockMaximized?: boolean;
    lockFullview?: boolean;
    safeMode?: boolean;
};
declare enum ChatboxColors {
    Default = "default",
    Amber = "amber",
    Black = "black",
    Blue = "blue",
    BlueGrey = "blue_grey",
    LightBlue = "light_blue",
    Brown = "brown",
    Cyan = "cyan",
    Green = "green",
    LightGreen = "light_green",
    Grey = "grey",
    Indigo = "indigo",
    Orange = "orange",
    DeepOrange = "deep_orange",
    Pink = "pink",
    Purple = "purple",
    DeepPurple = "deep_purple",
    Red = "red",
    Teal = "teal"
}
declare enum ChatboxPosition {
    Left = "left",
    Right = "right"
}
declare class Crisp {
    private clientUrl;
    private websiteId;
    private autoload;
    private tokenId?;
    private locale?;
    private sessionMerge?;
    private cookieDomain?;
    private cookieExpire?;
    private lockFullview?;
    private lockMaximized?;
    private safeMode?;
    private injected;
    chat: CrispChat;
    session: CrispSession;
    user: CrispUser;
    message: CrispMessage;
    trigger: CrispTrigger;
    constructor();
    configure(websiteId: string, options?: Options): void;
    load(): void;
    setTokenId(tokenId?: string): void;
    setZIndex(zIndex: number): void;
    setColorTheme(color: ChatboxColors): void;
    setHideOnAway(enabled: boolean): void;
    setHideOnMobile(enabled: boolean): void;
    setPosition(position: ChatboxPosition): void;
    setAvailabilityTooltip(enabled: boolean): void;
    setVacationMode(enabled: boolean): void;
    setSafeMode(safe?: boolean): void;
    muteSound(mute: boolean): void;
    toggleOperatorCount(enabled: boolean): void;
    onWebsiteAvailabilityChanged(callback: Function): void;
    offWebsiteAvailabilityChanged(): void;
    createSingletonIfNecessary(): void;
    autoInjectIfNecessary(): void;
    isCrispInjected(): boolean;
    private deferredLoading;
}
declare const singleton: Crisp;

export { AnimationMessage, AudioMessage, ChatboxColors, ChatboxPosition, CompanyData, CompanyDataEmployment, CompanyDataGeolocation, singleton as Crisp, Crisp as CrispClass, EventsColors, FieldMessage, FileMessage, Options, PickerMessage, PickerMessageChoices };
