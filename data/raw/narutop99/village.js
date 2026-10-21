import {msg} from './_l10n.js';

export default class Village {
    static list = [
        {
            slug: 'konoha',
            name: '木ノ葉',
            fullname: msg('leaf-village')
        },
        {
            slug: 'suna',
            name: '砂',
            fullname: msg('sand-village')
        },
        {
            slug: 'kiri',
            name: '霧',
            fullname: msg('mist-village')
        },
        {
            slug: 'kumo',
            name: '雲',
            fullname: msg('cloud-village')
        },
        {
            slug: 'iwa',
            name: '岩',
            fullname: msg('stone-village')
        },
        {
            slug: 'other',
            name: 'その他',
            fullname: msg('other')
        },
    ]
    static all() {
        return this.list;
    }
    static getName(slug) {
        return this.list.find((l) => l.slug == slug)?.name
    }
    static getFullname(slug) {
        return this.list.find((l) => l.slug == slug)?.fullname
    }
    static getSlug(name) {
        return this.list.find((l) => l.name == name)?.slug
    }
}