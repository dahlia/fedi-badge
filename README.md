Fedi badge
==========

This is a simple badge generator for ActivityPub-enabled social media platforms,
i.e., fediverse.  It is inspired by [Shields.io] and is intended to be used in
a similar way.  It does not support only Mastodon, but also other platforms like
Pleroma, Misskey, Pixelfed, and so on.[^1]

Here is an example of fedi badges:

<https://fedi-badge.minhee.org/@hongminhee@hollo.social/following.svg>

![@hongminhee@hollo.social](https://fedi-badge.minhee.org/@hongminhee@hollo.social/following.svg)

<https://fedi-badge.minhee.org/@hongminhee@hackers.pub/followers.svg>

![@hongminhee@hackers.pub](https://fedi-badge.minhee.org/@hongminhee@hackers.pub/followers.svg)

<https://fedi-badge.minhee.org/@hongminhee@fosstodon.org/posts.svg>

![@hongminhee@fosstodon.org](https://fedi-badge.minhee.org/@hongminhee@fosstodon.org/posts.svg)

<https://fedi-badge.minhee.org/@hongminhee@misskey.io/followers.svg>

![@hongminhee@misskey.io](https://fedi-badge.minhee.org/@hongminhee@misskey.io/followers.svg)

The pattern of the URL is:

    https://fedi-badge.minhee.org/@USER@DOMAIN/followers.svg
    https://fedi-badge.minhee.org/@USER@DOMAIN/following.svg
    https://fedi-badge.minhee.org/@USER@DOMAIN/posts.svg

The badge automatically shows the logo of the software running on the instance
(e.g., Mastodon, Misskey, Pleroma) on the left side, detected via [NodeInfo].
If the software is not recognized or NodeInfo is unavailable, a generic
fediverse logo is used instead.

Optionally, you can specify the following options in the query string:

 -  `label`: The label of the badge.  If not specified, it will be
    *@USER@DOMAIN*.
 -  `style`: The style of the badge.  It can be one of `plastic`, `flat`,
    `flat-square`, `for-the-badge`, `social`.  If not specified, it will be
    `social`.

Example:

    https://fedi-badge.minhee.org/@USER@DOMAIN/followers.svg?style=flat

Note that each badge is cached for an hour, so you may not see the immediate
change after your social media activity.

[^1]: Unless you configured your following/followers to be private.

[Shields.io]: https://shields.io/
[NodeInfo]: https://nodeinfo.diaspora.software/
