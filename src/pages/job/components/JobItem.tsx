const JobItem = () => {
    return (
        <div className="flex flex-row gap-4 items-center w-auto mx-4 bg-card-light h-20 rounded-lg px-4 py-5 cursor-pointer">
            <div className="w-6 h-6 bg-primary"></div>
            <div className="flex flex-col flex-1 gap-1">
                <h3>A good job</h3>
                <div className="flex flex-row items-center gap-1">
                    <p className="text-white/50 text-xs">jobType</p>
                    <p className="text-green-600">|</p>
                    <p className="text-white/50 text-xs">jobCategory</p>
                    <p className="text-green-600">|</p>
                    <p className="text-white/50 text-xs">jobTechnology</p>
                    <p className="text-green-600">|</p>
                    <p className="text-white/50 text-xs">jobTags</p>
                </div>
            </div>
            <div className="p-2 rounded-md bg-card text-sm">
                Unknown 1-3 days
            </div>
            <div className="p-2 rounded-md bg-card text-sm text-green-600 font-bold">
                $1.00
            </div>
        </div>
    );
};

export default JobItem;
