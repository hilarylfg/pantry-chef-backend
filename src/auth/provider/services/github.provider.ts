import { BaseOAuthService } from './base-oauth.service'
import { TypeProviderOptions } from './types/provider-options.types'
import { TypeUserInfo } from './types/user-info.types'

export class GithubProvider extends BaseOAuthService {
	public constructor(options: TypeProviderOptions) {
		super({
			name: 'github',
			authorize_url: 'https://github.com/login/oauth/authorize',
			access_url: 'https://github.com/login/oauth/access_token',
			profile_url: 'https://api.github.com/user',
			scopes: options.scopes,
			client_id: options.client_id,
			client_secret: options.client_secret
		})
	}

	public async extractUserInfo(data: GitHubProfile): Promise<TypeUserInfo> {
		let email: string

		const emailsResponse = await fetch(
			'https://api.github.com/user/emails',
			{
				headers: {
					Authorization: `Bearer ${data.access_token}`
				}
			}
		)

		if (emailsResponse.ok) {
			const emails: {
				email: string
				primary: boolean
				verified: boolean
				visibility: string | null
			}[] = await emailsResponse.json()
			const primaryEmail = emails.find(e => e.primary && e.verified)

			if (primaryEmail) {
				email = primaryEmail.email
			}
		}

		return super.extractUserInfo({
			id: String(data.id),
			email,
			name: data.name,
			picture: data.avatar_url
		})
	}
}

interface GitHubProfile extends Record<string, any> {
	login: string
	id: number
	node_id: string
	avatar_url: string
	gravatar_id: string
	url: string
	html_url: string
	followers_url: string
	following_url: string
	gists_url: string
	starred_url: string
	subscriptions_url: string
	organizations_url: string
	repos_url: string
	events_url: string
	received_events_url: string
	type: string
	site_admin: boolean
	name: string
	company: string
	blog: string
	location: string
	email: string
	hireable: boolean
	bio: string
	twitter_username: string
	public_repos: number
	public_gists: number
	followers: number
	following: number
	created_at: string
	updated_at: string
	private_gists: number
	total_private_repos: number
	owned_private_repos: number
	disk_usage: number
	collaborators: number
	two_factor_authentication: boolean
	plan: {
		name: string
		space: number
		collaborators: number
		private_repos: number
	}
}
