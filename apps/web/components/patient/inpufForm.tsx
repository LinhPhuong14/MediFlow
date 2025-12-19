"use client";
import React, { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const vietnamLocations = {
  cities: [
    { id: 1, name: "Thành phố Cần Thơ" },
    { id: 2, name: "Thành phố Hà Nội" },
    { id: 3, name: "Thành phố Huế" },
    { id: 4, name: "Thành phố Hồ Chí Minh" },

    { id: 5, name: "Tỉnh Bắc Giang" },
    { id: 6, name: "Tỉnh Bắc Ninh" },
    { id: 7, name: "Tỉnh Bình Dương" },
    { id: 8, name: "Tỉnh Bình Định" },
    { id: 9, name: "Tỉnh Bà Rịa - Vũng Tàu" },

    { id: 10, name: "Tỉnh Cao Bằng" },

    { id: 11, name: "Tỉnh Đà Nẵng" },
    { id: 12, name: "Tỉnh Điện Biên" },
    { id: 13, name: "Tỉnh Đồng Nai" },

    { id: 14, name: "Tỉnh Hà Tĩnh" },
    { id: 15, name: "Tỉnh Hải Dương" },
    { id: 16, name: "Tỉnh Hải Phòng" },
    { id: 17, name: "Tỉnh Hòa Bình" },
    { id: 18, name: "Tỉnh Hưng Yên" },

    { id: 19, name: "Tỉnh Khánh Hòa" },

    { id: 20, name: "Tỉnh Lai Châu" },
    { id: 21, name: "Tỉnh Lạng Sơn" },
    { id: 22, name: "Tỉnh Lào Cai" },
    { id: 23, name: "Tỉnh Lâm Đồng" },

    { id: 24, name: "Tỉnh Nam Định" },
    { id: 25, name: "Tỉnh Nghệ An" },
    { id: 26, name: "Tỉnh Ninh Bình" },

    { id: 27, name: "Tỉnh Phú Yên" },

    { id: 28, name: "Tỉnh Quảng Nam" },
    { id: 29, name: "Tỉnh Quảng Ngãi" },
    { id: 30, name: "Tỉnh Quảng Ninh" },

    { id: 31, name: "Tỉnh Sơn La" },

    { id: 32, name: "Tỉnh Thanh Hóa" },
    { id: 33, name: "Tỉnh Thái Nguyên" },
    { id: 34, name: "Tỉnh Tuyên Quang" },
  ],
  districts: [
    { id: 1, cityId: 1, name: "Phường Ninh Kiều" },
    { id: 2, cityId: 1, name: "Phường An Khánh" },
    { id: 3, cityId: 1, name: "Phường Bình Thủy" },
    { id: 4, cityId: 1, name: "Phường Thốt Nốt" },
    { id: 5, cityId: 1, name: "Xã Thạnh Phú" },
    { id: 6, cityId: 2, name: "Phường Ba Đình" },
    { id: 7, cityId: 2, name: "Phường Hoàn Kiếm" },
    { id: 8, cityId: 2, name: "Phường Đống Đa" },
    { id: 9, cityId: 2, name: "Phường Cầu Giấy" },
    { id: 10, cityId: 2, name: "Xã Đông Anh" },
    { id: 11, cityId: 3, name: "Phường Phú Nhuận" },
    { id: 12, cityId: 3, name: "Phường Thuận Hòa" },
    { id: 13, cityId: 3, name: "Phường An Cựu" },
    { id: 14, cityId: 3, name: "Phường Hương Long" },
    { id: 15, cityId: 3, name: "Xã Thủy Biều" },
    { id: 16, cityId: 4, name: "Phường Bến Nghé" },
    { id: 17, cityId: 4, name: "Phường Bến Thành" },
    { id: 18, cityId: 4, name: "Phường Thảo Điền" },
    { id: 19, cityId: 4, name: "Phường Tân Định" },
    { id: 20, cityId: 4, name: "Xã Bình Hưng" },
    //mock data cho demo
  ],
};

type City = {
  id: number;
  name: string;
};

type District = {
  id: number;
  cityId: number;
  name: string;
};

export function InputForm() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  );

  const [citySearch, setCitySearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const districtDropdownRef = useRef<HTMLDivElement>(null);
  // Lọc danh sách thành phố dựa trên tìm kiếm
  const filteredCities = vietnamLocations.cities.filter((city) =>
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Lọc danh sách quận dựa trên thành phố đã chọn và tìm kiếm
  const filteredDistricts = selectedCity
    ? vietnamLocations.districts.filter(
        (district) =>
          district.cityId === selectedCity.id &&
          district.name.toLowerCase().includes(districtSearch.toLowerCase())
      )
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({
      selectedCity,
      selectedDistrict,
      detailAddress,
    });
    //redirect to chatbot
    window.location.href = "patient/chatbot";
  };

  return (
    <div className="shadow-input mx-auto w-full max-w-lg rounded-none bg-transparent p-2 md:rounded-2xl md:p-4 md:mt-4 dark:bg-black">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        Chào bạn
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
        Hãy điền các thông tin cá nhân để MediFlow hỗ trợ bạn đặt lịch nhé
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="firstname">Họ </Label>
            <Input id="firstname" placeholder="Nguyen" type="text" required />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">Tên</Label>
            <Input id="lastname" placeholder="Van A" type="text" required />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input id="phone" placeholder="0123456789" type="tel" required />
        </LabelInputContainer>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Địa chỉ</h3>

          <div className="flex flex-col md:flex-row gap-2 mb-4">
            {/* CITY */}
            <LabelInputContainer>
              <Label>Thành phố / Tỉnh</Label>
              <div className="relative" ref={cityDropdownRef}>
                <div
                  className="border rounded-md px-3 py-2 cursor-pointer flex justify-between"
                  onClick={() => setIsCityDropdownOpen((v) => !v)}
                >
                  <span className={selectedCity ? "" : "text-gray-400"}>
                    {selectedCity?.name ?? "Chọn thành phố"}
                  </span>
                </div>

                {isCityDropdownOpen && (
                  <div className="absolute z-20 w-full bg-white border rounded-md mt-1">
                    <input
                      className="w-full p-2 border-b outline-none"
                      placeholder="Tìm thành phố..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                    />
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCities.map((city) => (
                        <div
                          key={city.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedCity(city);
                            setSelectedDistrict(null);
                            setDistrictSearch("");
                            setIsCityDropdownOpen(false);
                          }}
                        >
                          {city.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </LabelInputContainer>

            {/* DISTRICT */}
            <LabelInputContainer>
              <Label>Quận / Huyện</Label>
              <div className="relative" ref={districtDropdownRef}>
                <Input
                  disabled={!selectedCity}
                  placeholder={
                    selectedCity ? "Tìm quận/huyện..." : "Chọn thành phố trước"
                  }
                  value={districtSearch}
                  onFocus={() => setIsDistrictDropdownOpen(true)}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                />

                {isDistrictDropdownOpen && selectedCity && (
                  <div className="absolute z-20 w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto">
                    {filteredDistricts.map((district) => (
                      <div
                        key={district.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedDistrict(district);
                          setDistrictSearch(district.name);
                          setIsDistrictDropdownOpen(false);
                        }}
                      >
                        {district.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-6">
            <Label>Địa chỉ cụ thể</Label>
            <Input
              placeholder="Số nhà, tên đường..."
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              required
            />
          </LabelInputContainer>
        </div>
        <button
          type="submit"
          className="w-full h-10 rounded-md bg-black text-white hover:opacity-90"
        >
          Tiếp tục →
        </button>
      </form>
      {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-green-500/10 dark:from-blue-500/5 dark:via-transparent dark:to-green-500/5" /> */}
       </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
