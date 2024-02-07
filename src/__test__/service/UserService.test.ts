import { FindManyOptions } from "typeorm";
import { UpdateUserAccount } from "../../controllers/requestModels/UpdateUserAccount";
import { User } from "../../entities/User";
import {
  AuthError,
  BadInputError,
  BadRequestError,
} from "../../errorHandling/Errors";
import UserService from "../../service/UserService";
import {
  mockCreate,
  mockSave,
  mockFind,
  mockFindBy,
  mockFindOneBy,
  mockCreateQueryBuilder,
  mockFindAndCount,
} from "../TypeORMMocks";

jest.mock("../../entities/User", () => {
  return {
    User: {
      // Mock static methods directly
      create: (u: User) => mockCreate(u),
      save: (u: User) => mockSave(u),
      find: (u: FindManyOptions<User>) => mockFind(u),
      findBy: (u: User) => mockFindBy(u),
      findOneBy: (u: User) => mockFindOneBy(u),
      createQueryBuilder: () => mockCreateQueryBuilder(),
      findAndCount: (o: FindManyOptions<User>) => mockFindAndCount(o),
    },
  };
});

describe("User Service", () => {
  describe("Create user", () => {
    let userService: UserService;
    const mockFindUser = jest.fn();
    const mockFindOneByUser = jest.fn();
    beforeEach(() => {
      userService = new UserService();
      mockFindUser.mockReset();
      mockFindOneByUser.mockReset();
      User.find = mockFindUser;
      User.findOneBy = mockFindOneByUser;
    });

    // set up
    const newUserDetails = {
      email: "test@gmail.com",
      firstName: "John",
      lastName: "Doe",
      password: "test123",
    };

    const existingUsersWithoutNewUser: User[] = [
      User.create({
        email: "test2@gmail.com",
        firstName: "John2",
        lastName: "Doe2",
        password: "test1232",
      }),
      User.create({
        email: "test3@gmail.com",
        firstName: "John3",
        lastName: "Doe3",
        password: "$$$RRR",
      }),
    ];

    const existingUsersWithNewUser: User[] = [
      User.create({
        email: "test@gmail.com",
        firstName: "John",
        lastName: "Doe",
        password: "test123",
      }),
      User.create({
        email: "test2@gmail.com",
        firstName: "John2",
        lastName: "Doe2",
        password: "test1232",
      }),
      User.create({
        email: "test3@gmail.com",
        firstName: "John3",
        lastName: "Doe3",
        password: "$$$RRR",
      }),
    ];

    it("Should throw a BadInput Error when an invalid email is passed in", async () => {
      const userDetails = Object.assign({}, newUserDetails);
      userDetails.email = "3b87624fyfv44.dcjb.com";
      await expect(userService.createUser(userDetails)).rejects.toThrow(
        new BadInputError("Invalid email provided " + userDetails.email)
      );
    });

    it("Should throw a BadRequest Error when a user account with the email address already exists", async () => {
      // Set up
      const userDetails = Object.assign({}, newUserDetails);

      const { email, firstName, lastName, password } = userDetails;

      const existingUser = User.create();
      existingUser.email = email;
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.password = password;

      mockFindOneByUser.mockResolvedValueOnce(existingUser);

      // Act and expect
      await expect(userService.createUser(userDetails)).rejects.toThrow(
        new BadRequestError(
          "User with email id " + userDetails.email + " already exists."
        )
      );
    });
  });

  describe("Update user", () => {
    let userService: UserService;
    const mockFindUser = jest.fn();
    const mockFindOneByUser = jest.fn();
    beforeEach(() => {
      userService = new UserService();
      mockFindUser.mockReset();
      mockFindOneByUser.mockReset();
      User.find = mockFindUser;
      User.findOneBy = mockFindOneByUser;
    });

    it("Should throw an Auth error when an empty user name is passed in", async () => {
      await expect(
        userService.updateUser({} as UpdateUserAccount, "")
      ).rejects.toThrow(new AuthError("Unauthenticated user"));

      await expect(
        userService.updateUser({} as UpdateUserAccount, undefined)
      ).rejects.toThrow(new AuthError("Unauthenticated user"));
    });

    it("Should throw a BadInputError if none of the required properties are sent in for an update", async () => {
      const mockIsValidFn = jest.fn();

      const updateInfo = {
        isValid: mockIsValidFn,
      } as UpdateUserAccount;

      mockIsValidFn.mockReturnValue(false);

      await expect(
        userService.updateUser(updateInfo, "test@gmail.com")
      ).rejects.toThrow(
        new BadInputError(
          "At least one property must be provided to update the user account."
        )
      );
    });

    it("Should throw an Auth error if the user does not exist in the database", async () => {
      const mockIsValidFn = jest.fn();

      const updateInfo = {
        isValid: mockIsValidFn,
      } as UpdateUserAccount;

      mockIsValidFn.mockReturnValue(true);

      mockFindOneByUser.mockResolvedValueOnce(null);

      await expect(
        userService.updateUser(updateInfo, "test@gmail.com")
      ).rejects.toThrow(new AuthError("Unauthenticated user"));
    });
  });
});
