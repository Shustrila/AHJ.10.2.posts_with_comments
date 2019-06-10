import { ajax } from 'rxjs/ajax';
import { map, switchMap, catchError } from 'rxjs/operators';
import { of, range, Observer } from 'rxjs'

class Posts {
    constructor() {
        this.listPosts = [];
        this.root = {};
        this.list = {};
        this.show = 0;
        this._dmain = '';
        this.showAdd = {};
    }

    async init() {
        this.show = 1;
        this._dmain = 'https://ahj-posts-with-comments.herokuapp.com';
        this.root = document.querySelector('[data-widget="posts"]');
        this.list = document.querySelector('[data-posts="list"]');

        this.showAdd = document.querySelector('[data-posts="show-item"]');

        this.showAdd.addEventListener('click', e => this._getPosts());

        this._getPosts();
    }

    _getPosts(){
        this.list.classList.add('posts__list--load');
        this.showAdd.style.display = 'node';

        ajax.getJSON(`${this._dmain}/posts/latest`).pipe(
            map(res => (res.status === 'ok') ? res.messages : new Error('posts/latest')),
            catchError(err => of(err))
        ).subscribe(
            posts => {
                this._getComments(posts[this.show]);
                if(this.show < posts.length) this.show++;
            },
            err => new Error(err)
        );
    }

    _getComments(post) {
        const { id } = post;

        ajax.getJSON(`${this._dmain}/posts/${id}/comments/latest`).pipe(
            map(res => (res.status === 'ok') ? res.data : new Error('comments/latest')),
            catchError(err => of(err))
        ).subscribe(
            data =>  {
                const load = 'posts__list--load';

                if (this.list.classList.contains(load)) {
                    this.list.classList.remove(load);
                }

                post.comemets = data;

                this._createPosts(post);
            },
            err => new Error(err),
            () => this.showAdd.removeAttribute('style')
        );
    }

    _createPosts(post) {
        const { avatar, image, author, created, comemets } = post;

        const postImage = document.createElement('div');
        postImage.className = 'posts__item-image';
        postImage.style.backgroundImage = `url(${image})`;

        const item = document.createElement('li');
        item.className = 'posts__item';

        Posts._createPostsHead(item, avatar, author, created);
        item.appendChild(postImage);

        if (comemets.length !== 0) {
            const commentsTitle = document.createElement('p');
            commentsTitle.className = 'posts__comments-title comments__title';
            commentsTitle.innerHTML = 'Latest comments';

            const commentsList = document.createElement('ul');
            commentsList.className = 'posts__comments comments__list';

            for (const comemet of comemets) {
                const { avatar, author, content, created } = comemet;

                Posts._createComments(commentsList, avatar, author, created, content);
            }

            item.appendChild(commentsTitle);
            item.appendChild(commentsList);
        }

        this.list.appendChild(item);
    }

    static _createPostsHead(item, img, name, date){
        const image = document.createElement('div');
        image.className = 'posts__head-image';
        image.style.backgroundImage = `url(${img})`;

        const nodeName = document.createElement('p');
        nodeName.className = 'posts__head-name';
        nodeName.innerHTML = name;

        const nodeDate = document.createElement('p');
        nodeDate.className = 'posts__head-date';
        nodeDate.innerHTML = date;

        const wrapper = document.createElement('div');
        wrapper.className = 'posts__head-wrapper';
        wrapper.appendChild(nodeName);
        wrapper.appendChild(nodeDate);

        const head = document.createElement('div');
        head.className = 'posts__head';
        head.appendChild(image);
        head.appendChild(wrapper);

        item.appendChild(head);
    }

    static _createComments(commentsList, avatar, author, created, content) {
        const img = document.createElement('div');
        img.className = 'comments__avatar';
        img.style.backgroundImage = `url(${avatar})`;

        const nameText = document.createElement('p');
        nameText.className = 'comments__head-name';
        nameText.innerHTML = author;

        const dateText = document.createElement('p');
        nameText.className = 'comments__head-date';
        dateText.innerHTML = created;

        const head = document.createElement('div');
        head.className = 'comments__head';
        head.appendChild(nameText);
        head.appendChild(dateText);

        const commentText = document.createElement('p');
        commentText.className = 'comments__content';
        commentText.innerHTML = content;

        const wrapper = document.createElement('div');
        wrapper.className = 'comments__wrapper';
        wrapper.appendChild(head);
        wrapper.appendChild(commentText);

        const item = document.createElement('li');
        item.className = 'comments__item';
        item.appendChild(img);
        item.appendChild(wrapper);

        commentsList.appendChild(item)
    }
}

export default () => new Posts().init();
