import React from 'react';

function TopUsersComponent({ topUsers }) {
  return (
    <div className="flex flex-col py-1 mt-20 ml-32 max-w-full rounded-2xl border border-violet-600 bg-zinc-300 w-[892px] max-md:mt-10">
      <div className="items-start px-3.5 pt-3.5 pb-1 text-5xl bg-violet-600 rounded-2xl max-md:pr-5 max-md:max-w-full max-md:text-4xl">
        Top Users
      </div>
      {topUsers.map((user) => (
        <div key={user.id} className="flex z-10 gap-5 justify-between px-4 py-3 border-t bg-zinc-950 border-t-violet-600 max-md:flex-wrap max-md:max-w-full">
          <div className="flex flex-col self-start">
            <div className="text-4xl">{user.userName}</div>
            <div className="mt-4 text-xl">Monthly Earnings</div>
          </div>
          <div className="flex flex-col text-center">
            <div className="flex gap-5 whitespace-nowrap">
              <div className="text-4xl">$</div>
              <div className="flex-auto text-6xl max-md:text-4xl">{user.monthlyEarnings}</div>
            </div>
          </div>
        </div>
      ))}
      <div className="flex justify-end px-4 py-3">
        <a href="/seeMore" className="text-violet-600 underline">See More</a>
      </div>
    </div>
  );
}

export default TopUsersComponent;
