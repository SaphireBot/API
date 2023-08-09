export interface OauthValidade {
    client_id: string
    login: string
    scopes: string[]
    user_id: string
    expires_in: number
}

export interface FetchError {
    status: number
    message: string
}

export interface OauthToken {
    access_token: string
    expires_in: number
    id_token: string
    refresh_token: string
    scope: string[]
    token_type: string
}

export interface StreamData {
    id: string
    user_id: string
    user_login: string
    user_name: string
    game_id: string
    game_name: string
    type: string
    title: string
    tags: string[]
    viewer_count: number
    started_at: string
    language: string
    thumbnail_url: string
    tag_ids: string[],
    is_mature: boolean,
    profile_image_url: string | undefined
    display_name: string | undefined
}

export interface StreamsDataResponse {
    data: StreamData[]
    pagination: { cursor: string }
}

export interface UserData {
    id: string
    login: string
    display_name: string
    type: string
    broadcaster_type: string
    description: string
    profile_image_url: string
    offline_image_url: string
    view_count: number
    email: string
    created_at: string
}

export interface UsersDataResponse {
    data: UserData[]
}

export interface OfflineStreamersToNotifier {
    streamer: string,
    channels: string[]
}

export interface UpdateStreamerParams {
    streamer: string
    channelId: string
    guildId: string
}

export interface UpdateManyStreamerParams {
    streamer: string
    channelId: string
    oldChannelId: string | undefined
    roleId: string | undefined
    message: string | undefined
}

export interface RemoveChannelParams {
    streamer: string
    channelId: string
}