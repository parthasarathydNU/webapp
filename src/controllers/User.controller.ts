import {
  Body,
  Controller,
  Patch,
  Post,
  Route,
  Request,
  Get,
  SuccessResponse,
  Put,
  Tags,
  Query,
} from "tsoa";
import express from "express";
import UserService from "../service/UserService.js";
import ModelMapper from "./ModelMapper.js";
import { CreateUserAccount } from "./requestModels/CreateUserAccount.js";
import { UpdateUserAccount } from "./requestModels/UpdateUserAccount.js";
import { UserResponse } from "./responseModels/UserResponse.js";
import logMessage, { Severity } from "../utils/loggerUtil.util.js";
import { SetEmailValidity } from "./requestModels/SetEmailValidity.js";

@Route("/v1")
export class UserController extends Controller {
  private userService: UserService;
  constructor() {
    super();

    this.userService = new UserService();
  }

  @Get("user/self")
  @Tags("authenticated")
  async getUser(@Request() req: express.Request) {
    /**
     * Get User Information
     */
    const userName = req.user?.userName;

    const existingUser = await this.userService.getUser(userName);

    const response = ModelMapper(UserResponse, existingUser);

    this.setStatus(200);
    return response;
  }

  @Post("user")
  @Tags("public")
  @SuccessResponse(201)
  async createUser(
    @Body() userDetails: CreateUserAccount
  ): Promise<UserResponse> {
    /**
     * Create a user
     */
    const newUser = await this.userService.createUser(userDetails);

    const response = ModelMapper(UserResponse, newUser);

    this.setStatus(201);
    return response;
  }

  @Get("user/verifyEmail")
  @Tags("public")
  @SuccessResponse("204")
  async verifyEmail(@Query() username: string): Promise<void> {
    logMessage("Received request to validate users email", "UserController.VerifyEmail", "No issues with input", Severity.INFO);
    await this.userService.verifyEmail(username);
  }

  @Put("user/setValidity")
  @Tags("private")
  @SuccessResponse("201")
  async setEmailValidity(@Body() body: SetEmailValidity): Promise<void> {

    const { validUpto, username } = body;

    logMessage("Received messaged for updating email validity of user", "UserController.setEmailValidity", "Valid input", Severity.INFO);
    await this.userService.setEmailValidity(validUpto, username);
  }

  @Put("user/self")
  @Tags("authenticated")
  async updateUser(
    @Request() req: express.Request,
    @Body() updatedUserDetails: UpdateUserAccount
  ): Promise<void> {
    /**
     * Update user information
     */
    let userName = req.user?.userName;

    await this.userService.updateUser(updatedUserDetails, userName);

    this.setStatus(204);
  }
}
