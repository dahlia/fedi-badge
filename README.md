Fedi badge
==========

This is a simple badge generator for ActivityPub-enabled social media platforms,
i.e., fediverse.  It is inspired by [Shields.io] and is intended to be used in
a similar way.  It does not support only Mastodon, but also other platforms like
Pleroma, Misskey, Pixelfed, and so on.[^1]

Here is an example of a fedi badge:

https://fedi-badge.deno.dev/@hongminhee@fosstodon.org/followers.svg

![Follow @hongminhee@fosstodon.org](https://fedi-badge.deno.dev/@hongminhee@fosstodon.org/followers.svg)

The pattern of the URL is:

    https://fedi-badge.deno.dev/@USER@DOMAIN/followers.svg
    https://fedi-badge.deno.dev/@USER@DOMAIN/following.svg
    https://fedi-badge.deno.dev/@USER@DOMAIN/posts.svg

Optionally, you can specify the following options in the query string:

 -  `label`: The label of the badge.  If not specified, it will be automatically
    *Follow @USER@DOMAIN*.
 -  `style`: The style of the badge.  It can be one of `plastic`, `flat`,
    `flat-square`, `for-the-badge`, `social`.  If not specified, it will be
    `social`.

Example:

    https://fedi-badge.deno.dev/@USER@DOMAIN/followers.svg?style=flat

Note that each badge is cached for an hour, so you may not see the immediate
change after your social media activity.

[^1]: Unless you configured your following/followers to be private.

[Shields.io]: https://shields.io/
