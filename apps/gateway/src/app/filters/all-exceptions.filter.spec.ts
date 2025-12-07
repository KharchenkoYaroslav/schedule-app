import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';

type MockResponse = Partial<Response> & {
  status: jest.Mock<MockResponse, [number]>;
  json: jest.Mock<MockResponse, [unknown]>;
};

type MockRequest = Partial<Request> & {
  url: string;
};

type MockHttpArgumentsHost = Partial<HttpArgumentsHost> & {
  getRequest: jest.Mock<MockRequest, []>;
  getResponse: jest.Mock<MockResponse, []>;
};

type MockArgumentsHost = Partial<ArgumentsHost> & {
  switchToHttp: jest.Mock<MockHttpArgumentsHost, []>;
};

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockArgumentsHost: MockArgumentsHost;
  let mockHttpArgumentsHost: MockHttpArgumentsHost;
  let mockResponse: MockResponse;
  let mockRequest: MockRequest;

  beforeEach(async () => {
    mockRequest = {
      url: '/test-url',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockHttpArgumentsHost = {
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn().mockReturnValue(mockResponse),
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
  });

  it('повинен бути визначений', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('повинен обробляти HttpException і повертати коректну відповідь', () => {
      const errorMessage = 'Forbidden resource';
      const status = HttpStatus.FORBIDDEN;
      const exception = new HttpException(errorMessage, status);

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockArgumentsHost.switchToHttp).toHaveBeenCalled();
      expect(mockHttpArgumentsHost.getRequest).toHaveBeenCalled();
      expect(mockHttpArgumentsHost.getResponse).toHaveBeenCalled();

      expect(mockResponse.status).toHaveBeenCalledWith(status);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: status,
        timestamp: expect.any(String),
        path: mockRequest.url,
        message: errorMessage,
      });
    });

    it('повинен обробляти HttpException з об\'єктом у відповіді', () => {
      const errorResponse = { message: 'Validation failed', error: 'Bad Request' };
      const status = HttpStatus.BAD_REQUEST;
      const exception = new HttpException(errorResponse, status);

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(status);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: status,
        timestamp: expect.any(String),
        path: mockRequest.url,
        message: errorResponse.message,
      });
    });

    it('повинен обробляти невідомі помилки (не HttpException) як 500 Internal Server Error', () => {
      const exception = new Error('Some unexpected error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: mockRequest.url,
        message: 'Internal server error',
      });
    });
  });
});
