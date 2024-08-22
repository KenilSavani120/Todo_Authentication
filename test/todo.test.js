const { getTodoLists, createTodo, deleteTodo, updateTodo } = require('../controllers/todoController');
const todoList = require('../models/todoModel');
const { StatusCodes } = require('http-status-codes');

jest.mock('../models/todoModel');

describe('TodoController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTodoLists', () => {
        it('should fetch todo lists successfully', async () => {
            const req = {
                user: { id: 'userId' },
                query: { page: '1', limit: '3' } // Make sure query parameters are correctly passed
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
    
            // Mock todoList.find to return some data
            todoList.find.mockImplementationOnce(() => ({
                limit: jest.fn().mockImplementationOnce(() => ({
                    skip: jest.fn().mockResolvedValue([
                        { _id: '1', title: 'Task 1', task: 'Description 1' },
                        { _id: '2', title: 'Task 2', task: 'Description 2' },
                        { _id: '3', title: 'Task 3', task: 'Description 3' }
                    ])
                }))
            }));
    
            await getTodoLists(req, res);
    
            // Validate mock expectations
            expect(todoList.find).toHaveBeenCalledWith({ userId: 'userId' });
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith({
                data: [
                    { _id: '1', title: 'Task 1', task: 'Description 1' },
                    { _id: '2', title: 'Task 2', task: 'Description 2' },
                    { _id: '3', title: 'Task 3', task: 'Description 3' }
                ],
                message: 'List fetched successfully'
            });
        });
    
        it('should return not found if no todo items exist', async () => {
            const req = {
                user: { id: 'userId' },
                query: { page: '1', limit: '3' } // Include query parameters
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
    
            // Mock todoList.find to return an empty array
            todoList.find.mockImplementationOnce(() => ({
                limit: jest.fn().mockImplementationOnce(() => ({
                    skip: jest.fn().mockResolvedValue([])
                }))
            }));
    
            await getTodoLists(req, res);
    
            expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(res.json).toHaveBeenCalledWith({
                message: 'No to-do items found, please add one'
            });
        });
    
        it('should handle server error', async () => {
            const req = {
                user: { id: 'userId' },
                query: { page: '1', limit: '3' } // Include query parameters
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
    
            // Mock todoList.find to throw an error
            todoList.find.mockImplementationOnce(() => ({
                limit: jest.fn().mockImplementationOnce(() => ({
                    skip: jest.fn().mockRejectedValue(new Error('Database error'))
                }))
            }));
    
            await getTodoLists(req, res);
    
            expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Error in fetchList function',
                error: 'Database error'
            });
        });
    });
    
    describe('createTodo', () => {
        it('should create a new todo item successfully', async () => {
            const req = {
                body: { title: 'New Task', task: 'New Description' },
                user: { id: 'userId' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
    
            // Mock the create method to return a new to-do item
            todoList.create.mockResolvedValue({
                _id: '1',
                title: 'New Task',
                task: 'New Description',
                userId: 'userId'
            });
    
            await createTodo(req, res);
    
            // Check that create was called with the correct arguments
            expect(todoList.create).toHaveBeenCalledWith({
                title: 'New Task',
                task: 'New Description',
                userId: 'userId'
            });
            
            // Check that the response status and JSON are set correctly
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith({
                data: {
                    _id: '1',
                    title: 'New Task',
                    task: 'New Description',
                    userId: 'userId' // Ensure userId is included if your response includes it
                },
                message: 'Note added successfully'
            });
        });
    
        it('should return bad request if data is missing', async () => {
            const req = {
                body: { title: 'New Task' }, // Missing 'task'
                user: { id: 'userId' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };
    
            await createTodo(req, res);
    
            expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Please provide all data'
            });
        });
    
        it('should handle server error', async () => {
            const req = {
                body: { title: 'New Task', task: 'New Description' },
                user: { id: 'userId' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };
    
            // Mock the create method to throw an error
            todoList.create.mockRejectedValue(new Error('Database error'));
    
            await createTodo(req, res);
    
            // Check that the correct status and error message are sent
            expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Error in Add List function',
                error: 'Database error'
            });
        });
    });

    describe('deleteTodo', () => {
        it('should delete a todo item successfully', async () => {
            const req = {
                params: { id: '1' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            todoList.findByIdAndDelete.mockResolvedValue({
                _id: '1',
                title: 'Task to delete',
                task: 'Description'
            });

            await deleteTodo(req, res);

            expect(todoList.findByIdAndDelete).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.send).toHaveBeenCalledWith({
                message: 'To-Do item deleted successfully',
                data: {
                    _id: '1',
                    title: 'Task to delete',
                    task: 'Description'
                }
            });
        });

        it('should return not found if todo item does not exist', async () => {
            const req = {
                params: { id: '1' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            todoList.findByIdAndDelete.mockResolvedValue(null);

            await deleteTodo(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(res.send).toHaveBeenCalledWith({
                message: 'To-Do item not found'
            });
        });

        it('should handle server error', async () => {
            const req = {
                params: { id: '1' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            todoList.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

            await deleteTodo(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Error deleting to-do item',
                error: 'Database error'
            });
        });
    });

    describe('updateTodo', () => {
        it('should update a todo item successfully', async () => {
            const req = {
                params: { id: '1' },
                body: { title: 'Updated Task', task: 'Updated Description' },
                user: { id: 'userId' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
    
            // Mock the findOneAndUpdate method to return an updated todo item
            todoList.findOneAndUpdate.mockResolvedValue({
                _id: '1',
                title: 'Updated Task',
                task: 'Updated Description',
                userId: 'userId'
            });
    
            await updateTodo(req, res);
    
            // Check that findOneAndUpdate was called with the correct arguments
            expect(todoList.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: '1', userId: 'userId' },
                { title: 'Updated Task', task: 'Updated Description' },
                { new: true }
            );
            
            // Check that the response status and JSON are set correctly
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith({
                data: {
                    _id: '1',
                    title: 'Updated Task',
                    task: 'Updated Description',
                    userId: 'userId' // Ensure userId is included if your response includes it
                },
                message: 'Note updated successfully'
            });
        });
    
        it('should return bad request if neither title nor task is provided', async () => {
            const req = {
                params: { id: '1' },
                body: {}, // Empty body
                user: { id: 'userId' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };
    
            await updateTodo(req, res);
    
            expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
            expect(res.send).toHaveBeenCalledWith({
                message: 'At least one of title or task is required for update'
            });
        });
    
        it('should return not found if todo item does not exist or user is unauthorized', async () => {
            const req = {
                params: { id: '1' },
                body: { title: 'Updated Task' },
                user: { id: 'userId' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };
    
            todoList.findOneAndUpdate.mockResolvedValue(null);
    
            await updateTodo(req, res);
    
            expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Todo item not found or you are not authorized to update this item'
            });
        });
    
        it('should handle server error', async () => {
            const req = {
                params: { id: '1' },
                body: { title: 'Updated Task' },
                user: { id: 'userId' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };
    
            // Mock the findOneAndUpdate method to throw an error
            todoList.findOneAndUpdate.mockRejectedValue(new Error('Database error'));
    
            await updateTodo(req, res);
    
            expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Error in updateTodo function',
                error: 'Database error'
            });
        });
    });
});
    