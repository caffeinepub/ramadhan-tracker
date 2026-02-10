import Map "mo:core/Map";

module {
  type DailyContent = {
    quranReflection : Text;
    hadith : Text;
    motivation : Text;
  };

  type State = {
    var dailyContents : Map.Map<Int, DailyContent>;
  };

  public func run(state : State) : State {
    if (state.dailyContents.isEmpty()) {
      let newContents = Map.empty<Int, DailyContent>();
      newContents.add(
        0,
        {
          quranReflection = "Within hardship is ease (Quran 94:5)";
          hadith = "Kindness is a mark of faith, and whoever is not kind has no faith. (Muslim)";
          motivation = "Take one small step towards growth today. Remember, even a little can become a lot with consistent effort.";
        },
      );
      state.dailyContents := newContents;
    };
    state;
  };
};
