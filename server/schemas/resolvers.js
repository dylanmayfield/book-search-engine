// const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');


// Define the query and mutation functionality to work with the Mongoose models
const resolvers = {
    Query : {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({_id: context.user._id})
                .select('-__v -password')
                return userData;
            }
            throw new AuthenticationError('User not logged in');
        }
    },

    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
          },
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});
            if (!user) {
                throw new AuthenticationError('Incorrect password or email');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect password or email');
            }
            const token = signToken(user);
            return {user, token};
        },

        saveBook: async (parent, {bookData}, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    {_id: context.user._id},
                    {$push: {savedBooks: bookData}},
                    {new: true}
                );
                return updatedUser;
            }
            throw new AuthenticationError('User not logged in');
        },

        removeBook: async (parent, {bookId}, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    {_id: context.user._id},
                    {$pull: {savedBooks: {bookId: bookId}}},
                    {new: true}
                );
                return updatedUser;
            }
            throw new AuthenticationError('User not logged in');
        },
    }
};

module.exports = resolvers;
            
