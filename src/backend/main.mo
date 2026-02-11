import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  type Date = Int;
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
    amount : ?Nat;
    paymentLink : ?Text;
  };

  public type Sholat = {
    fajr : Bool;
    dhuhr : Bool;
    asr : Bool;
    maghrib : Bool;
    isha : Bool;
    dhuha : Bool;
    tarawih : Bool;
    qiyamulLail : Bool;
  };

  public type Task = {
    fasting : ?Fasting;
    tilawah : ?Tilawah;
    murojaah : ?Murojaah;
    tahfidz : ?Tahfidz;
    sedekah : ?Sedekah;
    sholat : ?Sholat;
  };

  public type DailyContent = {
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

  var sedekahPaymentLink : Text = "https://tribelio.page/site/donation/9U7UPN3Y";
  let accessControlState = AccessControl.initState();
  var adminCount : Nat = 0;

  include MixinAuthorization(accessControlState);

  // Check if admin bootstrap mode should be enabled (i.e., when no admin exists)
  public query ({ caller }) func isAdminBootstrapAvailable() : async Bool {
    adminCount == 0;
  };

  // Custom Admin Bootstrap Helper
  public shared ({ caller }) func promoteToAdmin(target : Principal) : async () {
    let _callerRole = AccessControl.getUserRole(accessControlState, caller);

    // Bootstrap mode: allow promotion if no admin exists in the system
    if (adminCount == 0) {
      // Bootstrap path: anyone can promote the first admin
      AccessControl.assignRole(accessControlState, caller, target, #admin);
      adminCount += 1; // Increment after first admin is set
    } else {
      // Normal path: only existing admins can promote
      if (not AccessControl.isAdmin(accessControlState, caller)) {
        Runtime.trap("Unauthorized: Only admins can promote users");
      };
      AccessControl.assignRole(accessControlState, caller, target, #admin);
      adminCount += 1; // Increment for each new admin
    };
  };

  // Remove admin rights from a user and update admin count.
  public shared ({ caller }) func removeAdminRights(target : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove admin rights");
    };

    // Verify target is currently admin
    let currentRole = AccessControl.getUserRole(accessControlState, target);
    switch (currentRole) {
      case (#admin) {
        // Proceed with removing admin rights
        AccessControl.assignRole(accessControlState, caller, target, #user);
        if (adminCount > 0) {
          adminCount -= 1; // Decrement if target was admin
        };
      };
      case (_) {
        // Target is not admin, do nothing.
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

  public shared ({ caller }) func createOrUpdateTask(date : Date, task : Task) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    let userData = switch (userTasks.get(caller)) {
      case (null) { Map.empty<Date, Task>() };
      case (?existing) { existing };
    };

    userData.add(date, task);
    userTasks.add(caller, userData);
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

  public shared ({ caller }) func createOrUpdateTaskForUser(user : Principal, date : Date, task : Task) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create tasks for users");
    };

    let userData = switch (userTasks.get(user)) {
      case (null) { Map.empty<Date, Task>() };
      case (?existing) { existing };
    };

    userData.add(date, task);
    userTasks.add(user, userData);
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
    sholatStats : {
      fajr : Nat;
      dhuhr : Nat;
      asr : Nat;
      maghrib : Nat;
      isha : Nat;
      dhuha : Nat;
      tarawih : Nat;
      qiyamulLail : Nat;
    };
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
        var fajr = 0;
        var dhuhr = 0;
        var asr = 0;
        var maghrib = 0;
        var isha = 0;
        var dhuha = 0;
        var tarawih = 0;
        var qiyamulLail = 0;

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
            switch (task.sholat) {
              case (?sholat) {
                if (sholat.fajr) { fajr += 1 };
                if (sholat.dhuhr) { dhuhr += 1 };
                if (sholat.asr) { asr += 1 };
                if (sholat.maghrib) { maghrib += 1 };
                if (sholat.isha) { isha += 1 };
                if (sholat.dhuha) { dhuha += 1 };
                if (sholat.tarawih) { tarawih += 1 };
                if (sholat.qiyamulLail) { qiyamulLail += 1 };
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
          sholatStats = {
            fajr = fajr;
            dhuhr = dhuhr;
            asr = asr;
            maghrib = maghrib;
            isha = isha;
            dhuha = dhuha;
            tarawih = tarawih;
            qiyamulLail = qiyamulLail;
          };
        };
      };
    };
  };

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
