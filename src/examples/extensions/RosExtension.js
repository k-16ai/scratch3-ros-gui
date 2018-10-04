var RosExtension = function () {
};

RosExtension.prototype.getInfo = function () {
    return {
        id: 'RosBlocks',
        name: 'Blocks for connecting with ROS',

        // Optional: URI for an icon for this extension. Data URI OK.
        // If not present, use a generic icon.
        // TODO: what file types are OK? All web images? Just PNG?
        iconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DE' +
            'UIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==',

        // Optional: Link to documentation content for this extension.
        // If not present, offer no link.
        // docsURI: 'https://....',

        // Required: the list of blocks implemented by this extension,
        // in the order intended for display.
        blocks: [
            {
                // Required: the machine-readable name of this operation.
                // This will appear in project JSON. Must not contain a '.' character.
                opcode: 'myReporter', // becomes 'someBlocks.myReporter'

                // Required: the kind of block we're defining, from a predefined list:
                // 'command' - a normal command block, like "move {} steps"
                // 'reporter' - returns a value, like "direction"
                // 'Boolean' - same as 'reporter' but returns a Boolean value
                // 'hat' - starts a stack if its value is truthy
                // 'conditional' - control flow, like "if {}" or "repeat {}"
                // A 'conditional' block may return the one-based index of a branch
                // to run, or it may return zero/falsy to run no branch. Each time a
                // child branch finishes, the block is called again. This is only a
                // slight change to the current model for control flow blocks, and is
                // also compatible with returning true/false for an "if" or "repeat"
                // block.
                // TODO: Consider Blockly-like nextStatement, previousStatement, and
                // output attributes as an alternative. Those are more flexible, but
                // allow bad combinations.
                blockType: Scratch.BlockType.REPORTER,

                // Required for conditional blocks, ignored for others: the number of
                // child branches this block controls. An "if" or "repeat" block would
                // specify a branch count of 1; an "if-else" block would specify a
                // branch count of 2.
                // TODO: should we support dynamic branch count for "switch"-likes?
                branchCount: 0,

                // Optional, default false: whether or not this block ends a stack.
                // The "forever" and "stop all" blocks would specify true here.
                isTerminal: true,

                // Optional, default false: whether or not to block all threads while
                // this block is busy. This is for things like the "touching color"
                // block in compatibility mode, and is only needed if the VM runs in a
                // worker. We might even consider omitting it from extension docs...
                blockAllThreads: false,

                // Required: the human-readable text on this block, including argument
                // placeholders. Argument placeholders should be in [MACRO_CASE] and
                // must be [ENCLOSED_WITHIN_SQUARE_BRACKETS].
                text: 'letter [LETTER_NUM] of [TEXT]',

                // Required: describe each argument.
                // Note that this is an array: the order of arguments will be used
                arguments: {
                    // Required: the ID of the argument, which will be the name in the
                    // args object passed to the implementation function.
                    LETTER_NUM: {
                        // Required: type of the argument / shape of the block input
                        type: Scratch.ArgumentType.NUMBER,

                        // Optional: the default value of the argument
                        defaultValue: 1
                    },

                    // Required: the ID of the argument, which will be the name in the
                    // args object passed to the implementation function.
                    TEXT: {
                        // Required: type of the argument / shape of the block input
                        type: Scratch.ArgumentType.STRING,

                        // Optional: the default value of the argument
                        defaultValue: 'text'
                    }
                },

                // Optional: a string naming the function implementing this block.
                // If this is omitted, use the opcode string.
                func: 'myReporter',

                // Optional: list of target types for which this block should appear.
                // If absent, assume it applies to all builtin targets -- that is:
                // ['sprite', 'stage']
                filter: ['someBlocks.wedo2', 'sprite', 'stage']
            },
            {
                opcode: 'example-Boolean',
                blockType: Scratch.BlockType.BOOLEAN,
                text: 'return true',
                func: 'returnTrue'
            },
            {
                opcode: 'example-hat',
                blockType: Scratch.BlockType.HAT,
                text: 'after forever',
                func: 'returnFalse'
            }
        ]
    };
};

/**
 * Implement myReporter.
 * @param {object} args - the block's arguments.
 * @property {number} LETTER_NUM - the string value of the argument.
 * @property {string} TEXT - the string value of the argument.
 * @returns {string} a string which includes the block argument value.
 */
RosExtension.prototype.myReporter = function (args) {
    // Note: this implementation is not Unicode-clean; it's just here as an example.
    const result = args.TEXT.charAt(args.LETTER_NUM);

    return ['Letter ', args.LETTER_NUM, ' of ', args.TEXT, ' is ', result, '.'].join('');
};

RosExtension.prototype.returnTrue = function () {
    return true;
};

RosExtension.prototype.returnFalse = function () {
    return false;
};

Scratch.extensions.register(new RosExtension());
