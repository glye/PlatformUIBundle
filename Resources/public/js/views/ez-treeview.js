/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-treeview', function (Y) {
    "use strict";
    /**
     *
     * @method ez-treeview
     */
    Y.namespace('eZ');

    var IS_TREE_NODE_LOADING = "is-tree-node-loading",
        IS_TREE_NODE_SELECTED = "is-tree-node-selected",
        IS_TREE_NODE_CLOSE = "is-tree-node-close",
        IS_TREE_NODE_OPEN = "is-tree-node-open",
        IS_TREE_NODE_ERROR = "is-tree-node-error",
        IS_TREE_LOADED = "is-tree-loaded";

    Y.eZ.TreeView = Y.Base.create('treeView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-tree-node-toggle': {
                'tap': '_toggleNode',
            },
            '.ez-tree-navigate': {
                'click': '_navigate',
            },
        },

        initializer: function () {
            Y.eZ.TemplateBasedView.registerPartial('ez_tree', 'tree-ez-partial');

            this.after('treeChange', this._uiBindTree);

            this.publish('treeNavigate', {
                bubbles: true,
                emitFacade: true,
                preventable: true,
                preventedFn: function (e) {
                    e.originalEvent.halt(true);
                },
            });
        },

        render: function () {
            this.get('container').setHTML(this.template());
            return this;
        },

        _navigate: function (e) {
            this.fire('treeNavigate', {
                originalEvent: e,
                tree: this.get('tree'),
                nodeId: e.target.ancestor('.ez-tree-node').getData('node-id'),
            });
        },

        /**
         * Defines the event handlers related to the tree
         *
         * @method _uiBindTree
         * @protected
         */
        _uiBindTree: function () {
            var tree = this.get('tree');

            tree.after('open', Y.bind(this._uiOpen, this));
            tree.after('close', Y.bind(this._uiClose, this));
            tree.after('select', Y.bind(this._uiSelect, this));
            tree.after('unselect', Y.bind(this._uiUnselect, this));
            tree.after('clear', Y.bind(this._uiClear, this));
            tree.lazy.on('load', Y.bind(this._uiLoad, this));
            tree.lazy.on('error', Y.bind(this._uiError, this));
        },

        /**
         * Tree load error event handler
         * 
         * @method _uiError
         * @protected
         * @param {Object} e event handler
         */
        _uiError: function (e) {
            this._getElementYNode(e.error.node)
                .addClass(IS_TREE_NODE_ERROR)
                .removeClass(IS_TREE_NODE_LOADING);
        },

        /**
         * Tree select event handler
         *
         * @method _uiSelect
         * @protected
         * @param {Object} e
         */
        _uiSelect: function (e) {
            if ( !e.node.isRoot() ) {
                this._getElementYNode(e.node).addClass(IS_TREE_NODE_SELECTED);
            }
        },

        /**
         * Tree unselect event handler
         *
         * @method _uiUnselect
         * @protected
         * @param {Object} e
         */
        _uiUnselect: function (e) {
            if ( !e.node.isRoot() ) {
                this._getElementYNode(e.node).removeClass(IS_TREE_NODE_SELECTED);
            }
        },

        /**
         * Tree load event handler
         *
         * @method _uiLoad
         * @protected
         * @param {Object} e
         */
        _uiLoad: function (e) {
            this._renderNodeChildren(e.node);
            if ( !e.node.isRoot() ) {
                this._getElementYNode(e.node).removeClass(IS_TREE_NODE_LOADING);
            }
        },

        /**
         * Tree open event handler
         *
         * @method _uiOpen
         * @protected
         * @param {Object} e
         */
        _uiOpen: function (e) {
            var node = e.node,
                ynode = this._getElementYNode(e.node);

            ynode.addClass(IS_TREE_NODE_OPEN).removeClass(IS_TREE_NODE_CLOSE);

            if ( node.state.loading ) {
                ynode.addClass(IS_TREE_NODE_LOADING).removeClass(IS_TREE_NODE_ERROR);
            }
        },

        /**
         * Tree close event handler
         *
         * @method _uiClose
         * @protected
         * @param {Object} e
         */
        _uiClose: function (e) {
            var ynode = this._getElementYNode(e.node);

            ynode.addClass(IS_TREE_NODE_CLOSE).removeClass(IS_TREE_NODE_OPEN);
        },

        /**
         * Tree clear event handler
         *
         * @method _uiClear
         * @protected
         * @param {Object} e
         */
        _uiClear: function (e) {
            this.get('container').removeClass(IS_TREE_LOADED);
            this._getTreeContentNode().empty();
        },

        /**
         * Renders the children of a given `node`. This uses the `ez_tree`
         * partials so it needs to be registered
         *
         * @method _renderNodeChildren
         * @protected
         * @param node {Y.Tree.Node}
         */
        _renderNodeChildren: function (node) {
            var template = this.template;

            if ( node.isRoot() ) {
                this.get('container')
                    .addClass(IS_TREE_LOADED)
                    .append(template(node.toJSON()));
            } else {
                this._getElementYNode(node).append(template(node.toJSON()));
            }
        },

        /**
         * Tap event handler on the `tree-node-toggle` link. It fires the
         * `toggleNode` event
         *
         * @method _toggleNode
         * @protected
         * @param {Object} e
         */
        _toggleNode: function (e) {
            e.preventDefault();
            /**
             * Fired when the tree node open state has to change
             *
             * @event toggleNode
             * @param {Number} nodeId the node id
             */
            this.fire('toggleNode', {
                nodeId: e.target.get('parentNode').getData('node-id')
            });
        },

        /**
         * Returns the Y.Node which renders the given `node`
         *
         * @method _getElementYNode
         * @private
         * @param {Y.Tree.Node} node
         * @return {Y.Node}
         */
        _getElementYNode: function (node) {
            return this.get('container').one('[data-node-id="' + node.id + '"]');
        },
    }, {
        ATTRS: {
            /**
             * Holds tree being displayed
             *
             * @attribute tree
             * @type eZ.ContentTree
             * @writeOnce
             */
            tree: {
                writeOnce: true,
            },
        },
    });
});
