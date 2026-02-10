import Text "mo:core/Text";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import DailyContentMigration "migration";

(with migration = DailyContentMigration.run)
actor {
  // Make this private. Public access must happen via functions.
  var sedekahPaymentLink : Text = "https://tribelio.page/site/donation/9U7UPN3Y";
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Date = Int; // Unix date representation
  type Range = {
    surah : Text;
    verseStart : Nat;
    verseEnd : Nat;
  };

  type Fasting = {
    isFasting : Bool;
    note : ?Text;
  };

  type Tilawah = Range;
  type Murojaah = Range;
  type Tahfidz = Range;

  public type Sedekah = {
    completed : Bool;
    paymentLink : ?Text; // must be nullable
  };

  type Task = {
    fasting : ?Fasting;
    tilawah : ?Tilawah;
    murojaah : ?Murojaah;
    tahfidz : ?Tahfidz;
    sedekah : ?Sedekah;
  };

  type DailyContent = {
    quranReflection : Text;
    hadith : Text;
    motivation : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    isActive : Bool;
  };

  type UserData = Map.Map<Date, Task>;
  let userTasks = Map.empty<Principal, UserData>();
  let dailyContents = Map.empty<Int, DailyContent>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Admin User Management
  public shared ({ caller }) func createUser(user : Principal, profile : UserProfile) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create users");
    };
    userTasks.add(user, Map.empty<Date, Task>());
    userProfiles.add(user, profile);
  };

  public shared ({ caller }) func updateUserProfile(user : Principal, profile : UserProfile) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update user profiles");
    };
    userProfiles.add(user, profile);
  };

  public shared ({ caller }) func deactivateUser(user : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can deactivate users");
    };
    switch (userProfiles.get(user)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?profile) {
        let updatedProfile = {
          name = profile.name;
          email = profile.email;
          isActive = false;
        };
        userProfiles.add(user, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func reactivateUser(user : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reactivate users");
    };
    switch (userProfiles.get(user)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?profile) {
        let updatedProfile = {
          name = profile.name;
          email = profile.email;
          isActive = true;
        };
        userProfiles.add(user, updatedProfile);
      };
    };
  };

  // Task Management - User Operations
  public shared ({ caller }) func createOrUpdateTask(date : Date, tasks : Task) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?userData) {
        userData.add(date, tasks);
      };
    };
  };

  public query ({ caller }) func getTask(date : Date) : async ?Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?userData) {
        userData.get(date);
      };
    };
  };

  public query ({ caller }) func getTasksInRange(startDate : Date, endDate : Date) : async [(Date, Task)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access tasks");
    };

    switch (userTasks.get(caller)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?userData) {
        let filtered = userData.entries().filter(
          func((date, _)) { date >= startDate and date <= endDate }
        );
        filtered.toArray();
      };
    };
  };

  // Task Management - Admin Operations
  public shared ({ caller }) func createOrUpdateTaskForUser(user : Principal, date : Date, tasks : Task) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create tasks for users");
    };

    switch (userTasks.get(user)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?userData) {
        userData.add(date, tasks);
      };
    };
  };

  public query ({ caller }) func getTaskForUser(user : Principal, date : Date) : async ?Task {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view other users' tasks");
    };

    switch (userTasks.get(user)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?userData) {
        userData.get(date);
      };
    };
  };

  public query ({ caller }) func getTasksInRangeForUser(user : Principal, startDate : Date, endDate : Date) : async [(Date, Task)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view other users' tasks");
    };

    switch (userTasks.get(user)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?userData) {
        let filtered = userData.entries().filter(
          func((date, _)) { date >= startDate and date <= endDate }
        );
        filtered.toArray();
      };
    };
  };

  // Daily Content Management
  public shared ({ caller }) func createOrUpdateContent(contentType : Int, content : DailyContent) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create content items");
    };
    dailyContents.add(contentType, content);
  };

  public query ({ caller }) func getContents() : async [DailyContent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view content");
    };
    dailyContents.values().toArray();
  };

  public shared ({ caller }) func deleteContent(contentType : Int) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete content items");
    };
    dailyContents.remove(contentType);
  };

  // Admin Statistics
  public query ({ caller }) func getAllUsers() : async [Principal] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userTasks.keys().toArray();
  };

  public query ({ caller }) func getUserStatistics(user : Principal, startDate : Date, endDate : Date) : async {
    fastingDays : Nat;
    tilawahEntries : Nat;
    murojaahEntries : Nat;
    tahfidzEntries : Nat;
    sedekahDays : Nat;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view user statistics");
    };

    switch (userTasks.get(user)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?userData) {
        var fastingDays = 0;
        var tilawahEntries = 0;
        var murojaahEntries = 0;
        var tahfidzEntries = 0;
        var sedekahDays = 0;

        for ((date, task) in userData.entries()) {
          if (date >= startDate and date <= endDate) {
            switch (task.fasting) {
              case (?fasting) {
                if (fasting.isFasting) { fastingDays += 1 };
              };
              case (null) {};
            };
            switch (task.tilawah) {
              case (?_) { tilawahEntries += 1 };
              case (null) {};
            };
            switch (task.murojaah) {
              case (?_) { murojaahEntries += 1 };
              case (null) {};
            };
            switch (task.tahfidz) {
              case (?_) { tahfidzEntries += 1 };
              case (null) {};
            };
            switch (task.sedekah) {
              case (?sedekah) {
                if (sedekah.completed) { sedekahDays += 1 };
              };
              case (null) {};
            };
          };
        };

        {
          fastingDays = fastingDays;
          tilawahEntries = tilawahEntries;
          murojaahEntries = murojaahEntries;
          tahfidzEntries = tahfidzEntries;
          sedekahDays = sedekahDays;
        };
      };
    };
  };

  // Sedekah Payment Link Management
  public shared ({ caller }) func setSedekahPaymentLink(link : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update Payment link");
    };
    sedekahPaymentLink := link;
  };

  public query ({ caller }) func getSedekahPaymentLink() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access the payment link");
    };
    sedekahPaymentLink;
  };
};
