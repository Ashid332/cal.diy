"use client";

import { usePathname } from "next/navigation";

import { useCompatSearchParams } from "@calcom/lib/hooks/useCompatSearchParams";

export const useUrlMatchesCurrentUrl = (url: string, matchFullPath?: boolean) => {
  // I don't know why usePathname ReturnType doesn't include null.
  // It can certainly have null value https://nextjs.org/docs/app/api-reference/functions/use-pathname#:~:text=usePathname%20can%20return%20null%20when%20a%20fallback%20route%20is%20being%20rendered%20or%20when%20a%20pages%20directory%20page%20has%20been%20automatically%20statically%20optimized%20by%20Next.js%20and%20the%20router%20is%20not%20ready.
  const pathname = usePathname() as null | string;
  const searchParams = useCompatSearchParams();
  let sortedCurrentQuery = "";
  if (searchParams) {
    const params = new URLSearchParams(searchParams.toString());
    params.sort();
    sortedCurrentQuery = params.toString();
  }

  const pathnameWithQuery = pathname !== null && sortedCurrentQuery ? `${pathname}?${sortedCurrentQuery}` : pathname;

  let sortedTargetUrl = url;
  const hashSplit = url.split("#");
  const hash = hashSplit.length > 1 ? `#${hashSplit[1]}` : "";
  const pathAndQuery = hashSplit[0];
  
  const [targetPath, targetQueryString] = pathAndQuery.split("?");
  if (targetQueryString !== undefined) {
    const targetParams = new URLSearchParams(targetQueryString);
    targetParams.sort();
    const sortedTargetQuery = targetParams.toString();
    sortedTargetUrl = sortedTargetQuery ? `${targetPath}?${sortedTargetQuery}${hash}` : `${targetPath}${hash}`;
  }

  if (matchFullPath) {
    return pathnameWithQuery ? pathnameWithQuery === sortedTargetUrl : false;
  }
  
  return pathnameWithQuery ? pathnameWithQuery.includes(sortedTargetUrl) : false;
};
